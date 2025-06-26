import { Component } from "react";
import { useNavigate, useParams } from 'react-router-dom';

class Update extends Component {
    state = {
        title: '',
        description: '',
        status: '',
        dueDate: '',
        isLoading: true, // Initial loading state for fetching task details
        isSubmitting: false, // For form submission loading state
        error: null,      // For displaying initial fetch errors
        formError: ''   // For displaying form submission errors
    }

    componentDidMount() {
    const { id } = this.props.params;

    fetch(`https://taskmanagerass-backend6.onrender.com`)
        .then(res => res.json())
        .then(tasks => {
            const task = tasks.find(task => task.id === id);
            if (task) {
                this.setState({
                    title: task.title,
                    description: task.description || '',
                    status: task.status,
                    dueDate: task.dueDate || '',
                    isLoading: false
                });
            } else {
                this.setState({ error: 'Task not found.', isLoading: false });
            }
        })
        .catch(err => {
            console.error('Error fetching task details:', err);
            this.setState({ error: 'Failed to load task.', isLoading: false });
        });
}


    onSubmitForm = async event => {
        event.preventDefault();

        const { title, description, status, dueDate } = this.state;
        const { id } = this.props.params;

        

        this.setState({ isSubmitting: true, formError: '' }); // Set submitting state, clear previous errors

        const taskDetails = {
            title,
            description,
            status,
            dueDate
        };



        try {
            const res = await fetch(`http://localhost:9000/tasks/${id}`, {
                method: 'PUT', // Using PUT as per your backend
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskDetails)
            });
            



  const data = await res.json(); // Always try to parse JSON for more specific errors



if (!res.ok) {

 this.setState({ formError: data.message || 'Failed to update task.', isSubmitting: false });

 } else {

 console.log('Task Updated:', data);

 this.setState({ isSubmitting: false });

 this.props.navigate('/home', { replace: true }); 
 }

} catch (err) {
 console.error('Network or server error during update:', err);

 this.setState({ formError: 'Failed to connect with server. Please check if the backend is running.', isSubmitting: false });
 }
}



           
            
            
    

    
    onChangeTitle = event => { this.setState({ title: event.target.value }) }
    onChangeDescription = event => { this.setState({ description: event.target.value }) }
    onChangeStatus = event => { this.setState({ status: event.target.value }) }
    onChangeDate = event => { this.setState({ dueDate: event.target.value }) }

    render() {
        const { title, description, status, dueDate, isLoading, isSubmitting, error, formError } = this.state;

        // Conditional rendering for initial loading and error states
        if (isLoading) {
            return <div style={{textAlign: 'center', padding: '20px'}}>Loading task details...</div>;
        }

        if (error) {
            return <div style={{textAlign: 'center', color: 'red', padding: '20px'}}>Error: {error}</div>;
        }

        return (
            <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '25px', color: '#333' }}>Update Task</h1>
                {formError && <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px' }}>{formError}</p>}
                <div>
                    <form onSubmit={this.onSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label htmlFor="title" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
                            <input
                                id='title'
                                type='text'
                                value={title}
                                onChange={this.onChangeTitle}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
                            {/* Corrected to use <textarea> for multiline input */}
                            <textarea
                                id='description'
                                value={description}
                                onChange={this.onChangeDescription}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' }}
                            ></textarea>
                        </div>
                        <div>
                            <label htmlFor="status" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status:</label>
                            {/* The 'value' prop on <select> controls the selected option. */}
                            <select
                                id='status'
                                onChange={this.onChangeStatus}
                                value={status}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                required
                            >
                                <option value='todo'>Todo</option>
                                <option value='in_progress'>In Progress</option>
                                <option value='done'>Done</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="dates" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Due Date:</label>
                            <input
                                type='date'
                                id='dates'
                                onChange={this.onChangeDate}
                                value={dueDate}
                                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={isSubmitting} 
                            style={{
                                padding: '10px 20px',
                                backgroundColor: isSubmitting ? '#6c757d' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontSize: '1.1em',
                                marginTop: '15px'
                            }}
                        >
                            {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}


function UpdateWithRouter(props) {
    const navigate = useNavigate();
    const params = useParams(); 
    return <Update {...props} navigate={navigate} params={params} />;
}

export default UpdateWithRouter;
