export default class ArgumentUtils {

    public static getValue(envKey: string, argsKey: string, def?: string | undefined): any {
        if (process.env.hasOwnProperty(envKey)) {
            return process.env[envKey];
        }

        const args: Array<string> = process.argv;
        const len: number = args.length;
        for (let i = 0; i < len; i++) {
            if (args[i] === argsKey) {
                const hasNext = i + 1 < len;

                return hasNext ? (args[i + 1] || '') : '';
            }
        }
        return def;
    }
}
