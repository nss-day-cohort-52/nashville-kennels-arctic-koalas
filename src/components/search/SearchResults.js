import React, { useEffect, useState } from "react"
import { useLocation } from "react-router-dom";
import "./SearchResults.css"
import Employee from "../employees/Employee";
import Location from "../locations/Location";
import useModal from "../../hooks/ui/useModal";
import OwnerRepository from "../../repositories/OwnerRepository";
import AnimalOwnerRepository from "../../repositories/AnimalOwnerRepository";
import AnimalRepository from "../../repositories/AnimalRepository";
import { Animal } from "../animals/Animal";
import useSimpleAuth from "../../hooks/ui/useSimpleAuth"

export default () => {
    const location = useLocation()
    const { getCurrentUser } = useSimpleAuth()
    const [animals, petAnimals] = useState([])
    const [animalOwners, setAnimalOwners] = useState([])
    const [owners, updateOwners] = useState([])
    const [currentAnimal, setCurrentAnimal] = useState({ treatments: [] })
    let { toggleDialog, modalIsOpen } = useModal("#dialog--animal")

    const syncAnimals = () => {
        AnimalRepository.getAll().then(data => petAnimals(data))
    }

    useEffect(() => {
        OwnerRepository.getAllCustomers().then(updateOwners)
        AnimalOwnerRepository.getAll().then(setAnimalOwners)
        syncAnimals()
    }, [])

    const showTreatmentHistory = animal => {
        setCurrentAnimal(animal)
        toggleDialog()
    }

    useEffect(() => {
        const handler = e => {
            if (e.keyCode === 27 && modalIsOpen) {
                toggleDialog()
            }
        }

        window.addEventListener("keyup", handler)

        return () => window.removeEventListener("keyup", handler)
    }, [toggleDialog, modalIsOpen])

    const displayAnimals = () => {
        if (location.state?.animals.length) {
            return (
                <React.Fragment>
                    <h2>Matching Animals</h2>
                    {getCurrentUser().employee ?
                    <section className="animals">
                        {location.state.animals.map(anml =>
                        <Animal key={`animal--${anml.id}`} animal={anml}
                            animalOwners={animalOwners}
                            owners={owners}
                            syncAnimals={syncAnimals}
                            setAnimalOwners={setAnimalOwners}
                            showTreatmentHistory={showTreatmentHistory}
                        />)}
                    </section>:
                    "non-employees may not search for animals" }
                </React.Fragment>
            )
        }
    }

    const displayEmployees = () => {
        if (location.state?.employees.length) {
            return (
                <React.Fragment>
                    <h2>Matching Employees</h2>
                    <section className="employees">
                        {location.state.employees.map(a => <Employee key={a.id} employee={a} />)}
                    </section>
                </React.Fragment>
            )
        }
    }

    const displayLocations = () => {
        if (location.state?.locations.length) {
            return (
                <React.Fragment>
                    <h2>Matching Locations</h2>
                    <section className="locations">
                        {location.state.locations.map(l => <Location key={l.id} location={l} />)}
                    </section>
                </React.Fragment>
            )
        }
    }

    return (
        <React.Fragment>
            <article className="searchResults">
                {displayAnimals()}
                {displayEmployees()}
                {displayLocations()}
            </article>
        </React.Fragment>
    )
}
