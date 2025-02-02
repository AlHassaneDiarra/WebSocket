import React, { useState } from 'react';

const Register = ({ socket }) => {
    const [name, setName] = useState('');

    const handleRegister = () => {
        if (name) {
            socket.emit("register", name); // Émet l'événement d'inscription
            setName(''); // Réinitialise le champ de nom
        }
    };

    return (
        <div>
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Entrez votre nom" 
            />
            <button onClick={handleRegister}>S'inscrire</button>
        </div>
    );
};

export default Register;

