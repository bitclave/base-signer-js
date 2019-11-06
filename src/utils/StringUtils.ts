export class StringUtils {

    public static generateString(max: number = 32, withSpecSymbols: boolean = true): string {
        let text = '';
        const specSymbols: string = '~!@#$%^&*()_-+=[]{}';
        const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            .concat((withSpecSymbols) ? specSymbols : '');

        for (let i = 0; i < max; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    public static isEmpty(value?: string): boolean {
        return typeof value !== 'string' || value.trim().length === 0;
    }
}
