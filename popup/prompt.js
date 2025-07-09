export const getSystemPrompt = (context) => {
  if (!context || !context.languageText || !context.problemText || !context.sourceCodeText) {
    return null;
  }

  return `You are a senior software engineer bot. Your task is to solve the following LeetCode problem.
Provide a complete, working solution in the specified language.
Do not include any explanations, introductory text, or additional formatting.
Return only the raw code for the solution.

The problem context is as follows:
Title: ${context.titleText}
Language: ${context.languageText}
Problem Statement: ${context.problemText}
Source Code: ${context.sourceCodeText}
--- END CONTEXT ---
`;
};