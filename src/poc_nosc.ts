import { Engine } from 'json-rules-engine';

interface Facts {
  isAIAAgent: boolean;
  productAvailed: string;
  age: number;
  hasDependents: boolean;
  hasMedicalCondition: boolean;
}

// Rule Evaluation Part
const createEngine = () => {
  const engine = new Engine();

  // Rule 1: Check if application is from AIA agent
  engine.addRule({
    conditions: {
      all: [{
        fact: 'isAIAAgent',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'approved',
      params: {
        message: 'Proceed to next check'
      }
    }
  });

  // Rule 2: Check if product availed is IVF
  engine.addRule({
    conditions: {
      all: [{
        fact: 'productAvailed',
        operator: 'equal',
        value: 'IVF'
      }]
    },
    event: {
      type: 'declined',
      params: {
        message: 'Application declined due to IVF product'
      }
    }
  });

  // Rule 3: Check if age is greater than 65
  engine.addRule({
    conditions: {
      all: [{
        fact: 'age',
        operator: 'greaterThanInclusive',
        value: 65
      }]
    },
    event: {
      type: 'declined',
      params: {
        message: 'Application declined due to age greater than 65'
      }
    }
  });

  // Rule 4: Check if age is less than 18
  engine.addRule({
    conditions: {
      all: [{
        fact: 'age',
        operator: 'lessThan',
        value: 18
      }]
    },
    event: {
      type: 'declined',
      params: {
        message: 'Application declined due to age less than 18'
      }
    }
  });

  // Rule 5: Check if user has dependents
  engine.addRule({
    conditions: {
      all: [{
        fact: 'hasDependents',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'pending',
      params: {
        message: 'Application pending due to dependents'
      }
    }
  });

  // Rule 6: Check if user has a medical condition
  engine.addRule({
    conditions: {
      all: [{
        fact: 'hasMedicalCondition',
        operator: 'equal',
        value: true
      }]
    },
    event: {
      type: 'pending',
      params: {
        message: 'Application pending due to medical condition'
      }
    }
  });

  return engine;
};

// Function 1: Rule Evaluation
const evaluateRules = async (facts: Facts) => {
  const engine = createEngine();
  const results = await engine.run(facts);
    console.log('Results:', results.events);
  // Collect all triggered events
  const events = results.events.map(event => ({
    decision: event.type,
    message: event.params!.message
  }));

  return events;
};

// Function 2: Decision Processing
const processDecision = (events: { decision: string, message: string }[]) => {
  let finalDecision = 'approved'; // Default decision
  let finalMessage = 'Application approved'; // Default message

  for (const event of events) {
    if (event.decision === 'declined') {
      finalDecision = 'declined';
      finalMessage = event.message;
      // Don't break to allow all rules to be evaluated
    }
    if (event.decision === 'pending' && finalDecision !== 'declined') {
      finalDecision = 'pending';
      finalMessage = event.message;
    }
  }

  return {
    decision: finalDecision,
    message: finalMessage
  };
};

// Usage example
const processApplication = async (facts: Facts) => {
  const events = await evaluateRules(facts);
  const finalResult = processDecision(events);
  return finalResult;
};

// Test Cases
const factsList: Facts[] = [
//   { isAIAAgent: true, productAvailed: 'Health', age: 30, hasDependents: false, hasMedicalCondition: false },
  { isAIAAgent: true, productAvailed: 'IVF', age: 30, hasDependents: false, hasMedicalCondition: false },  // This should return declined
//   { isAIAAgent: true, productAvailed: 'Health', age: 90, hasDependents: false, hasMedicalCondition: false },
//   { isAIAAgent: true, productAvailed: 'Health', age: 30, hasDependents: true, hasMedicalCondition: false },
//   { isAIAAgent: true, productAvailed: 'Health', age: 90, hasDependents: true, hasMedicalCondition: false }
];

factsList.forEach(async (facts) => {
  const result = await processApplication(facts);
  console.log(`Facts: ${JSON.stringify(facts)} -> Decision: ${result.decision}, Message: ${result.message}`);
});
