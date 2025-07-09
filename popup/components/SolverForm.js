import { useState, useEffect } from "react";
import Switch from "react-switch";

import pacman from "../../pacman.svg";

import "../styles/solver-form.scss";

function SolverForm() {
	const [loading, setLoading] = useState(false);
	const [apiKey, setApiKey] = useState(process.env.OPENAI_API_KEY || "");
	const [apiUrl, setApiUrl] = useState("https://api.openai.com/v1/chat/completions");
	const [chatHistory, setChatHistory] = useState([
		{
			role: "assistant",
			content: "Hi! I'm your AI assistant. How can I help you today?"
		}
	]);
	const [input, setInput] = useState("");
	const [leetCodeProblemInfo, setLeetCodeProblemInfo] = useState(null);

	// Load API key and URL from chrome.storage.local on mount
	useEffect(() => {
		chrome.storage.local.get(["openai_api_key", "openai_api_url"], (result) => {
			if (result.openai_api_key) {
				setApiKey(result.openai_api_key);
			}
			if (result.openai_api_url) {
				setApiUrl(result.openai_api_url);
			}
		});
	}, []);

	// Fetch current LeetCode problem info on mount
	useEffect(() => {
		let interval;
		const fetchCurrentProblemInfo = () => {
			chrome.runtime.sendMessage(
				{ type: "get-current-problem" },
				(response) => {
					if (response) {
						clearInterval(interval);
						setLeetCodeProblemInfo(response);
					}
				}
			);
		};
		interval = setInterval(fetchCurrentProblemInfo, 100);
		return () => clearInterval(interval);
	}, []);

	const handleApiKeyChange = (e) => {
		const value = e.target.value;
		setApiKey(value);
		chrome.storage.local.set({ openai_api_key: value });
	};

	const handleApiUrlChange = (e) => {
		const value = e.target.value;
		setApiUrl(value);
		chrome.storage.local.set({ openai_api_url: value });
	};

	const handleSend = async () => {
		if (!input.trim()) return;
		if (!apiKey) {
			alert("OpenAI API key is not set. Please enter your API key below.");
			return;
		}

		const currentInput = input;
		const updatedChatHistory = [...chatHistory, { role: "user", content: currentInput }];
		setChatHistory(updatedChatHistory);
		setInput("");
		setLoading(true);

		// Always fetch the latest problem context before each LLM call
		chrome.runtime.sendMessage({ type: "get-current-problem" }, async (context) => {
			let problemContextMsg = null;
			if (context && context.languageText && context.problemText && context.sourceCodeText) {
				problemContextMsg = {
					role: "system",
					content: `You are a senior software engineer bot. Your task is to solve the following LeetCode problem.
Provide a complete, working solution in the specified language.
Do not include any explanations, introductory text, or additional formatting.
Return only the raw code for the solution.

The problem context is as follows:
Title: ${context.titleText}
Language: ${context.languageText}
Problem Statement: ${context.problemText}
Source Code: ${context.sourceCodeText}
--- END CONTEXT ---
`
				};
			}

			const newHistory = [
				problemContextMsg,
				...chatHistory.filter(msg => msg.role !== "system"),
				{ role: "user", content: currentInput }
			].filter(Boolean);

			try {
				const response = await fetch(apiUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${apiKey}`
					},
					body: JSON.stringify({
						model: "gpt-4o",
						messages: newHistory,
						temperature: 0.2
					})
				});
				const result = await response.json();
				if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
					setChatHistory([
						...updatedChatHistory,
						{ role: "assistant", content: result.choices[0].message.content }
					]);
				} else {
					setChatHistory([
						...updatedChatHistory,
						{ role: "assistant", content: "No response returned. Please check your API key and usage limits." }
					]);
				}
			} catch (e) {
				console.log(e);
				setChatHistory([
					...updatedChatHistory,
					{ role: "assistant", content: "Error contacting OpenAI API." }
				]);
			}
			setLoading(false);
		});
	};

	const handleInputKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="solver-form">
			<div className="solver-form__chat">
				{chatHistory.map((msg, idx) => (
					<div
						key={idx}
						className={`solver-form__chat-message solver-form__chat-message--${msg.role}`}
					>
						{msg.content}
					</div>
				))}
				{loading && (
					<div className="solver-form__chat-message solver-form__chat-message--assistant">
						Typing...
					</div>
				)}
			</div>
			<form
				className="solver-form__input-row"
				onSubmit={e => {
					e.preventDefault();
					handleSend();
				}}
			>
				<textarea
					className="solver-form__input"
					value={input}
					onChange={e => setInput(e.target.value)}
					onKeyDown={handleInputKeyDown}
					placeholder="Type your message..."
					rows={2}
					disabled={loading}
				/>
				<button
					type="submit"
					className="solver-form__send-btn"
					disabled={loading || !input.trim()}
				>
					Send
				</button>
			</form>
		</div>
	);
}

export default SolverForm;