export const OxfordList = (resources: Array<Object>, namespace: string) => {

    const propArray: Array<string> = namespace.split(".")

    const display = (resource: Object) => { //reasorces has to be an obj
        return propArray.reduce(
            (data: Object, property: string) => { // data has to be an obj, while property is a string
                // @ts-ignore
                return data[property]
            }, resource
        )
    }

    return resources.reduce(
        (list: string, resource: Object, idx: number, resourceArray: Array<Object>) => {
            const output = display(resource)
            return `${list}${
                (resourceArray.length > 1 && idx === resourceArray.length - 1)
                    ? `, and ${output}`
                    : idx === 0
                        ? `${output}`
                        : `, ${output}`
                }`
        },
        ""
    )
}

///this page is typescript. we know this because of the tsx extention at the end of the file name
//typescript is an extention of javascript. it will add types to the javascript for specificity and to prevent bugs
// type script is strict so that it will not allow types outside of what is specified