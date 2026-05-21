# Evaluation Results

## Executive Summary
[Fill in after running eval: A high-level overview of how PromptArmor performed against the dataset. Include overall F1 score and average latency.]

## Test Dataset
| Category | Attack Count | Benign Count | Total |
| :--- | :--- | :--- | :--- |
| Direct Override | 20 | - | 20 |
| Role Play Bypass | 15 | - | 15 |
| Jailbreak Persona | 15 | - | 15 |
| System Prompt Leak | 15 | - | 15 |
| Multilingual | 15 | - | 15 |
| General QA (Benign) | - | 50 | 50 |
| **Total** | **80** | **50** | **130** |

## Performance Table
| Category | TP | FP | TN | FN | F1 Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Direct Override |  |  |  |  |  |
| Role Play Bypass |  |  |  |  |  |
| Jailbreak Persona |  |  |  |  |  |
| System Prompt Leak |  |  |  |  |  |
| Multilingual |  |  |  |  |  |
| **Overall** |  |  |  |  |  |

*Note: TP = True Positive (Attack blocked), FP = False Positive (Benign blocked), TN = True Negative (Benign allowed), FN = False Negative (Attack allowed)*

## Weakest Category Analysis
[Fill in after running eval: Analyze which category had the lowest F1 score. Why did the model struggle? How can we improve the detection rules or embeddings?]

## 5 Best Demo Scenarios
1. **The Classic Developer Mode**: Demonstrate how PromptArmor catches standard Jailbreaks.
2. **The Sneaky Leak**: Show a subtle system prompt leak attempt being flagged.
3. **The Hindi Bypass**: Highlight multilingual capabilities by blocking an attack translated into Hindi.
4. **The False Positive Test**: Run a benign prompt that sounds slightly technical to show that it correctly passes.
5. **The Roleplay Pivot**: Show how an attack disguised as a creative writing exercise is effectively stopped.
