
# Server di Gestione Corsi

Questo progetto è un server Node.js che gestisce un sistema di corsi. Gli amministratori possono creare, modificare ed eliminare corsi, mentre chiunque può accedere alle informazioni sui corsi disponibili.

## Prerequisiti

Prima di iniziare, assicurati di avere installato Node.js e npm sul tuo sistema. Puoi scaricarli dal sito ufficiale [Node.js](https://nodejs.org/).

## Installazione

1. Clona il repository sul tuo sistema:

```bash
git clone https://github.com/andrea.cauchi/nome-tuo-repository.git
```

2. Installa le dipendenze:

```bash
npm install
```

3. Crea un file `.env` nella radice del progetto per ogni DB che si vuole usare con le seguenti variabili d'ambiente:

```env
MONGO_URI=tuo-indirizzo-mongodb
```
```env.test
MONGO_URI=tuo-indirizzo-mongodb-test
```
```env.stage
MONGO_URI=tuo-indirizzo-mongodb-stage
```

## Comandi disponibili

- `npm start:stage`: Avvia il server in modalità di sviluppo (stage).
- `npm start`: Avvia il server in modalità di produzione.
- `npm dev`: Avvia il server utilizzando nodemon per il riavvio automatico durante lo sviluppo.
- `npm test`: Esegue i test utilizzando Mocha.

## API Endpoints

### Gestione Amministratori (Admins)

- `POST /admins/signup`: Registra un nuovo amministratore.
- `GET /admins/emailvalidation/:uuid`: Conferma l'email dell'amministratore.
- `POST /admins/login`: Effettua il login per ottenere un token JWT.
- `POST /admins/me`: Restituisce un messaggio di benvenuto utilizzando il token dell'amministratore.

### Gestione Corsi (Courses)

- `GET /courses`: Ottieni la lista dei corsi disponibili.
- `GET /courses/:_id`: Ottieni dettagli su un corso specifico per ID.
- `GET /courses/:category`: Ottieni dettagli su un corso specifico per categoria.
- `DELETE /courses/:_id`: Elimina un corso esistente (Richiede autenticazione admin).
- `POST /courses`: Crea un nuovo corso (Richiede autenticazione admin).
- `PUT /courses/:_id`: Aggiorna i dettagli di un corso esistente (Richiede autenticazione admin).
- `PATCH /courses/:_id`: Modifica parziale di un corso esistente (Richiede autenticazione admin).
