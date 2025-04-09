document.getElementById('generate-site').addEventListener('click', () => {
    const companyName = document.getElementById('company-name').value;
    const sector = document.getElementById('sector').value;

    if (companyName && sector) {
        const preview = document.getElementById('preview-content');
        preview.innerHTML = `
            <h3>Bem-vindo à ${companyName}</h3>
            <p>Setor: ${sector}</p>
            <img src="${document.getElementById('logo-upload').files[0]?.name || 'assets/img/default-logo.jpg'}" alt="Logo ${companyName}">
        `;
        document.getElementById('generated-site-preview').classList.remove('hidden');
    } else {
        alert('Preencha todos os campos!');
    }
});
