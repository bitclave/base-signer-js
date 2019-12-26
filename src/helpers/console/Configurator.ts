import * as inquirer from 'inquirer';
import CryptoUtils from '../CryptoUtils';
import JsonUtils from '../JsonUtils';

const fs = require('fs');

export class Configurator {

    private static CONFIGURATION_FILE: string = './config';

    private static result: Map<string, string> = new Map();

    public static async prepareConfiguration(): Promise<Map<string, string>> {
        Configurator.result.clear();

        if (fs.existsSync(Configurator.CONFIGURATION_FILE)) {
            await Configurator.loadConfiguration();

        } else {
            await Configurator.inputPort();
            await Configurator.inputNodeHost();
            await Configurator.inputMnemonic();
            await Configurator.inputPassword();

            const pass: string | undefined = Configurator.result.get('pass');
            Configurator.result.delete('pass');

            if (pass) {
                await Configurator.saveConfiguration(pass, Configurator.result);
            } else {
                throw new Error('Internal error! Pass not found!');
            }
        }

        return Configurator.result;
    }

    private static async inputPort(): Promise<Map<string, string>> {
        const answers: any = await inquirer.prompt([
            {
                type: 'input',
                name: 'port',
                default: '3545',
                message: 'Enter port of signer'
            }
        ]);

        return Configurator.result.set('port', answers.port);
    }

    private static async inputNodeHost(): Promise<Map<string, string>> {
        const answers: any = await inquirer.prompt([
            {
                type: 'input',
                name: 'node',
                default: 'https://base2-bitclva-com.herokuapp.com',
                message: 'Enter Base node host'
            }
        ]);

        return Configurator.result.set('node', answers.node);
    }

    private static async inputMnemonic(): Promise<Map<string, string>> {
        const answers: any = await inquirer.prompt([
            {
                type: 'input',
                name: 'mnemonic',
                message: 'Enter mnemonic'
            }
        ]);

        return Configurator.result.set('mnemonic', answers.mnemonic);
    }

    private static async inputPassword(): Promise<Map<string, string>> {
        const pass: string = await this.inputConfigPass();

        if (!Configurator.result.has('pass')) {
            console.log('Please repeat password...');
            Configurator.result.set('pass', pass);

            return await Configurator.inputPassword();

        } else {
            if (Configurator.result.get('pass') !== pass) {
                Configurator.result.delete('pass');
                console.log('Password incorrect. Please reenter password...');

                return await Configurator.inputPassword();
            }

            return Configurator.result;
        }
    }

    private static async inputConfigPass(): Promise<string> {
        return await inquirer.prompt([
            {
                type: 'password',
                name: 'pass',
                mask: '*',
                message: 'Enter password'
            }
        ]).then((answer: any) => answer.pass);
    }

    private static async saveConfiguration(pass: string, data: Map<string, string>) {
        const json: any = JsonUtils.mapToJson(data);
        const str: string = JSON.stringify(json);

        const encrypted: string = CryptoUtils.encryptAes256(str, pass);

        await fs.writeFileSync(Configurator.CONFIGURATION_FILE, encrypted);
    }

    private static async loadConfiguration() {
        const encrypted: string = await fs.readFileSync(Configurator.CONFIGURATION_FILE).toString();

        let countTry = 0;
        while (countTry < 3) {
            const pass = await this.inputConfigPass();

            try {
                const decrypted: string = CryptoUtils.decryptAes256(encrypted, pass);

                const map: Map<string, string> = JsonUtils.jsonToMap(JSON.parse(decrypted));
                Configurator.result.clear();

                map.forEach((value, key) => {
                    Configurator.result.set(key, value);
                });

                return;
            } catch (e) {
                // ignore error
            }

            countTry++;
        }
    }
}
