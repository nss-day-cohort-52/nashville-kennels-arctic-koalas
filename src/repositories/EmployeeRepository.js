import Settings from "./Settings"
import { fetchIt } from "./Fetch"

export default {
    async get(id) {
        const user= await fetchIt(`${Settings.remoteURL}/users?id=${id}`)
        const userLocations = await fetchIt(`${Settings.remoteURL}/employeeLocations?userId=${id}&_expand=location&_expand=user`)
        return await fetchIt(`${Settings.remoteURL}/animalCaretakers?userId=${id}&_expand=animal`)
            .then(data => {
                const userWithRelationships = user[0]
                userWithRelationships.locations = userLocations
                userWithRelationships.animals = data
                return userWithRelationships
            })
    },

    async delete(id) {
        return await fetchIt(`${Settings.remoteURL}/users/${id}`, "DELETE")
    },
    async addEmployee(employee) {
        return await fetchIt(`${Settings.remoteURL}/users`, "POST", JSON.stringify(employee))
    },
    async assignEmployee(rel) {
        return await fetchIt(`${Settings.remoteURL}/employeeLocations`, "POST", JSON.stringify(rel))
    },
    async unassignEmployee(id) {
        return await fetchIt(`${Settings.remoteURL}/employeeLocations/${id}`, "DELETE")
    },
    async getAll() {
        return await fetchIt(`${Settings.remoteURL}/users?employee=true&_embed=employeeLocations`)
    }
}
