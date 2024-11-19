document.addEventListener('DOMContentLoaded', () => {
  const deleteButtons = document.querySelectorAll('.delete-note');

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const vehicleId = button.getAttribute('data-vehicle-id');
      const noteIndex = button.getAttribute('data-note-index');

      const confirmDelete = confirm('Are you sure you want to delete this note?');
      if (!confirmDelete) return;

      try {
        const response = await fetch(`/notes/${vehicleId}/${noteIndex}`, { method: 'DELETE' });
        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          location.reload(); // Reload the page to reflect changes
        } else {
          alert(result.error || 'Failed to delete note.');
        }
      } catch (err) {
        console.error('Error deleting note:', err);
        alert('An error occurred while trying to delete the note.');
      }
    });
  });
});
