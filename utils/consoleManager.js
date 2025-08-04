import dotenv from 'dotenv';

dotenv.config();

class ConsoleManager {
    log(data) {
        switch (process.env.env) {
            case 'dev':
                console.log(data);
                break;
            case 'prod':
                break;
            case 'stagging':
                break;
            default:
                break;
        }
    }
    error(data) {
        switch (process.env.env) {
            case 'dev':
                console.log(data);
                break;
            case 'prod':
                break;
            case 'stagging':
                break;
            default:
                break;
        }
    }
}

export default new ConsoleManager();