import Settings from "./icons/Settings"

import "../styles/header.scss";

function Header() {
	return (
		<div className="header flex align-center justify-between" style={{
			background: "linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%)",
			padding: "18px 24px",
			borderBottom: "1px solid #e3e8ee",
			boxShadow: "0 2px 8px 0 rgba(79,140,255,0.06)"
		}}>
			<div className="header__brand flex align-center">
				<img
					src="https://leetcode.com/static/images/LeetCode_logo_rvs.png"
					alt="LeetCode"
					style={{
						width: 32,
						height: 32,
						borderRadius: "8px",
						marginRight: 12,
						background: "#fff"
					}}
				/>
				<span style={{
					fontWeight: 700,
					fontSize: 20,
					color: "#fff",
					letterSpacing: "0.5px"
				}}>
					LeetCode AI Solver
				</span>
			</div>
			<Settings classes="settings__icon" />
		</div>
	)
}

export default Header;