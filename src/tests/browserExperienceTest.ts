import { BrowserExperienceValidator } from '../services/browserExperienceValidator';

export const runBrowserExperienceTests = () => {
  const result = BrowserExperienceValidator.runValidations();
  if (!result.passed) {
    throw new Error(`Browser Experience Test Failed: ${result.details.join(', ')}`);
  }
  return result;
};
