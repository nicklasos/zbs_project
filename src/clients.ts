import clients from '../config/clients';

export default {

    findByApiKey(apiKey): string | null {
        for (const name in clients) {
            if (clients.hasOwnProperty(name) && clients[name].api_key === apiKey) {
                return name;
            }
        }

        return null;
    },

    findByName(name: string): any {
        return clients[name];
    },

}
