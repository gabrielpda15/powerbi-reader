import { Dictionary } from "./generic-types";

type ArgumentKeys = 'input' | 'output';
type ArgumentValues = { [key in ArgumentKeys]: string | boolean };

export class Arguments {

    private static instance: Arguments;
    private static argumentKeyMapper: { [key: string]: ArgumentKeys } = {
        'i': 'input',
        'o': 'output'
    };

    private static getDefaultArguments(): ArgumentValues {
        const argumentKeyList = Object.values(this.argumentKeyMapper);
        return argumentKeyList.reduce<ArgumentValues>((pv, cv) => ({ ...pv, [cv]: false }), {} as any);
    }

    private executablePath: string;
    private scriptPath: string;

    private arguments: ArgumentValues;

    private constructor() 
    {
        const args = [ ...process.argv ];
        
        this.executablePath = args.shift();
        this.scriptPath = args.shift();
        this.arguments = Arguments.getDefaultArguments();
        
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (arg.startsWith('-')) {
                const trimmedArg = arg.replace(/^-+/g, '');
                const key = (arg.startsWith('--') && trimmedArg in this.arguments)
                    ? trimmedArg : Arguments.argumentKeyMapper[trimmedArg];

                this.arguments[key] = (i + 1 < args.length && !args[i + 1].startsWith('-'))
                    ? args[i + 1] : true;
            }
        }
    }

    public static get(): ArgumentValues {   
        if (!this.instance) this.instance = new Arguments();
        return this.instance.arguments;
    }

}