const DynamicTable = ({collection}) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Question</th>
                    <th>Options</th>
                    <th>Answer</th>
                </tr>
            </thead>
            <tbody>
                {
                    collection.map((curr, index) => {  // iteratre over each object in collection
                        const {question, options, answer} = curr; // store current items
                        
                        return (    // Table row is returned for each object
                            <tr key={index}>
                                <td>{question}</td>
                                <td>
                                    <ul>    {/* Options are individually mapped and displayed in an unordered list */}
                                        {options.map((option, i) => (
                                            <li key={i}>{option}</li>
                                        ))}
                                    </ul>
                                </td>
                                <td>{answer}</td>
                            </tr>
                        )
                    })
                }
            </tbody>
        </table>
    )
}

export default DynamicTable;