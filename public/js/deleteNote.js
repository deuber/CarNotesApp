document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.delete-note').forEach(button => {
    button.addEventListener('click', async (event) => {
      const vehicleId = button.getAttribute('data-vehicle-id');
      const noteIndex = button.getAttribute('data-note-index');

      if (confirm('Are you sure you want to delete this note?')) {
        try {
          const response = await fetch(`/notes/${vehicleId}/${noteIndex}`, { method: 'DELETE' });

          if (response.ok) {
            const result = await response.json(); // Parse JSON response
            alert(result.message);
            location.reload(); // Reload the page to update the notes list
          } else {
            const error = await response.json(); // Parse error JSON
            alert(`Failed to delete note: ${error.error}`);
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          alert('An error occurred while deleting the note');
        }
      }
    });
  });
});
