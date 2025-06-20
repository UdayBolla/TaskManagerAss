import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import TaskDetails from '../TaskDetails'; // Ensure correct path to TaskDetails

function Tasks() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useCallback is used to memoize fetchData, preventing it from being
    // recreated on every render if its dependencies don't change.
    // This is good practice when passing functions down as props or in useEffect dependencies.
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null); // Clear previous errors
        try {
            const response = await fetch('http://localhost:9000/tasks');
            if (!response.ok) {
                // Throw an error if the HTTP response status is not 2xx
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError('Failed to load tasks. Please try again later.'); // User-friendly error message
        } finally {
            setIsLoading(false); // Always set loading to false after fetch attempt
        }
    }, []); // Empty dependency array means fetchData function is created once

    // useEffect to call fetchData when the component mounts or fetchData changes (which it won't here)
    useEffect(() => {
        fetchData();
    }, [fetchData]); // fetchData is a dependency because it's used inside useEffect

    // Handler for successful deletion, passed down to TaskDetails
    const handleDeleteSuccess = (deletedTaskId) => {
        // Option 1: Re-fetch all data. Simple and ensures data consistency with the backend.
        fetchData();

        // Option 2: More performant for very large lists - filter the state directly.
        // This is an optimistic update. If the backend fails, you might need to re-fetch.
        // setData(prevData => prevData.filter(task => task.id !== deletedTaskId));
    };

    // Conditional rendering based on loading, error, and data states
    if (isLoading) {
        return <div style={{textAlign: 'center', padding: '20px'}}>Loading tasks...</div>;
    }

    if (error) {
        return <div style={{textAlign: 'center', color: 'red', padding: '20px'}}>Error: {error}</div>;
    }

    if (data.length === 0) {
        return (
            <div style={{textAlign: 'center', padding: '20px'}}>
                <p>No tasks found.</p>
                <Link to={`/add`} style={{textDecoration: 'none', color: 'blue', fontWeight: 'bold'}}>Add a new task</Link> to get started!
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Your Tasks</h1>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Link to={`/add`} style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    Add New Task
                </Link>
            </div>
            <div style={{ display: 'grid', gap: '20px' }}>
                {data.map(each => (
                    <TaskDetails
                        key={each.id} // Added key prop for list rendering
                        Details={each}
                        onDeleteSuccess={handleDeleteSuccess} // Pass the handler for deletion
                    />
                ))}
            </div>
        </div>
    );
}

export default Tasks;
