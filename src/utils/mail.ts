import nodemailer from 'nodemailer'

//istanzio il mittente
export const sender = nodemailer.createTransport({
    host: 'smtp.ethereal.email', //uso ethreal per simulare l'invio di email
    port: 587,
    auth: {
        user: 'chelsie.hahn@ethereal.email', //credenziali temporanee
        pass: 'rKnXJyv6sBgdU25WTr'
    }
});

//creo la mail generica da inviare
export const mail = {
from: 'chelsie.hahn@ethereal.email',
to: '',
subject: 'Confirm your email address',
text: 'Click here to confirm your account: '
};


