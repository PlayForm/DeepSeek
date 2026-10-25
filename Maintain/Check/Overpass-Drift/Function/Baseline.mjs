import FileSystem from "node:fs";

import BaselinePath from "../Variable/BaselinePath.mjs";

export default () => {
	switch (true) {
		case !FileSystem.existsSync(BaselinePath):
			return null;
	}
	return JSON.parse(FileSystem.readFileSync(BaselinePath, "utf8"));
};
