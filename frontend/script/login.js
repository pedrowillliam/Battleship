document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const username = form.querySelector('input[type="text"]').value;
      const password = form.querySelector('input[type="password"]').value;
  
      if (!username || !password) {
        alert('Preencha todos os campos!');
        return;
      }
  
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          alert(data.message);
          console.log('Registro realizado com sucesso', data);
        } else {
          alert(data.message || 'Erro no login!');
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro na conexão com o servidor.');
      }
    });
  });
  