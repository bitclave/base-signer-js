export default class ArgumentUtils {

    public static getValue(key: string, def: string | undefined = undefined): any {
        const args: Array<string> = process.argv;
        const len: number = args.length;
        for (let i = 0; i < len; i++) {
            if (args[i] === key) {
                const hasNext = i + 1 < len;

                return hasNext ? (args[i + 1] || '') : '';
            }
        }
        return def;
    }

}
