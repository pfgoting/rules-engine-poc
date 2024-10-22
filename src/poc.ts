import { Engine, Fact } from 'json-rules-engine';
import rules from './rules.json';
import ivfRules from './rules_ivf.json';

// Define the types for facts and events
// interface Facts {
//     age: number;
//     sex: string;
//     civilStatus: string;
//     medicalHistory: string;
// }

interface CustomRuleEvent {
    type: string;
    params: {
        message: string;
        condition: string;
    };
}

// Create an engine instance
const engine = new Engine();

// Add each rule to the engine
async function addRules(rules: any) {
    rules.forEach((rule: any) => {
        engine.addRule(rule);
    });
};

// Function to evaluate the input data against the ruleset
async function evaluateRules(facts: any): Promise<CustomRuleEvent[]> {
    try {
        const results = await engine.run(facts);
        return results.events as unknown as CustomRuleEvent[];
    } catch (error) {
        console.error(error);
        return [];
    }
}

// Function to decide the status of the application
function decideStatus(events: CustomRuleEvent[]): string {
    let status = 'approved';
    for (const event of events) {
        if (event.type === 'declined') {
            return 'declined';
        }
        if (event.type === 'pending') {
            status = 'pending';
        }
    }
    return status;
}

// Define the facts
// const facts: any = {
//     age: 20,
//     sex: 'male',
//     civilStatus: 'single',
//     medicalHistory: 'none'
// };
const defaultFacts = { isAIAAgent: false, productAvailed: 'none', hasDependents: false, hasMedicalCondition: false, age: 'none' };
const providedFacts = { isAIAAgent: true, productAvailed: 'IVF', hasDependents: false, hasMedicalCondition: true, age: 30 };
const facts = { ...defaultFacts, ...providedFacts }

console.log('Application Form:', facts);

async function processApplication(rules: any) {
    await addRules(rules);
    const events = await evaluateRules(facts);
    console.log('Evaluation:', events);
    const status = decideStatus(events);
    console.log('Application Status:', status);
}

processApplication(ivfRules);