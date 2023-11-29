export default class ZbsError extends Error {
    private type: string;
    private params: any;

    /**
     * @param {string} message
     * @param {string} type
     * @param {object|null} params
     */
    constructor(message = '', type = '', params = null) {
        super(message);
        this.type = type;
        this.params = params;
    }

    getType(): string {
        return this.type;
    }

    getParams(): any {
        return this.params;
    }
}
