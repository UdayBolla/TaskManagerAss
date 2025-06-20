import { Link } from 'react-router-dom';

const TaskDetails = ({ Details, onDeleteSuccess }) => { // Destructure onDeleteSuccess from props
    const { id, title, description, status, dueDate, createdAt, updatedAt } = Details;

    // Function to handle the delete button click
    const handleDelete = async () => {
        // Prompt user for confirmation before deleting
        if (window.confirm(`Are you sure you want to delete task "${title}"? This action cannot be undone.`)) {
            try {
                const response = await fetch(`http://localhost:9000/tasks/${id}`, {
                    method: 'DELETE',
                });

                if (response.status === 204) { // 204 No Content is the expected success status for DELETE
                    console.log('Task deleted successfully!');
                    alert(`Task "${title}" deleted successfully.`);
                    // Call the callback function provided by the parent (Tasks component)
                    if (onDeleteSuccess) {
                        onDeleteSuccess(id);
                    }
                } else if (response.status === 404) {
                    console.error('Task not found for deletion.');
                    alert('Task not found. It might have already been deleted.');
                } else {
                    // Attempt to parse error message from backend if response is not 204/404
                    const errorData = await response.json();
                    console.error('Failed to delete task:', errorData);
                    alert(`Failed to delete task: ${errorData.message || 'Unknown error occurred.'}`);
                }
            } catch (error) {
                console.error('Network error during deletion:', error);
                alert('An error occurred while trying to delete the task. Please check your network.');
            }
        }
    };

    return (
        <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '15px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
            {/* Conditional rendering and formatting for description */}
            <p style={{ margin: '0' }}><strong>Description:</strong> {description || 'No description provided.'}</p>
            <p style={{ margin: '0' }}><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: status === 'done' ? 'green' : status === 'in_progress' ? 'orange' : 'blue' }}>{status.replace(/_/g, ' ')}</span></p>
            {/* Conditional rendering and formatting for due date */}
            <p style={{ margin: '0' }}><strong>Due Date:</strong> {dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A'}</p>
            {/* Date formatting for created and updated timestamps */}
            <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}><strong>Created:</strong> {new Date(createdAt).toLocaleString()}</p>
            <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}><strong>Last Updated:</strong> {new Date(updatedAt).toLocaleString()}</p>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <Link to={`/edit/${id}`} style={{ textDecoration: 'none' }}>
                    <button style={{
                        padding: '8px 15px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1em'
                    }}>
                        Edit
                    </button>
                </Link>
                {/* Delete button triggering the handleDelete function */}
                <button onClick={handleDelete} style={{
                    padding: '8px 15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1em'
                }}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default TaskDetails;
