const DynamicTable = ({collection}) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {
                    collection.map((curr) => {  // iteratre over each object in collection
                        const {id, name, email} = curr; // store current items
                        
                        return (    // Table row is returned for each object
                            <tr key={id}>
                                <td>{id}</td>
                                <td>{name}</td>
                                <td>{email}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

export default DynamicTable;