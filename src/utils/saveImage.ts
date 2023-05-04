import fs from "fs";
import { compressImage } from "./compressImage";

async function saveImage(imgId: string) {
	const imgUrl = `https://i.redd.it/${imgId}.png`;
	const imgPath = `./images/${imgId}.jpeg`;
	const response = await fetch(imgUrl);
	const blob = await response.blob();
	const arrayBuffer = await blob.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	await fs.promises.writeFile(imgPath, buffer);
	const imgSize = fs.statSync(imgPath).size;
	if (imgSize > 976560) {
		compressImage(imgSize, imgPath);
	}
}

export { saveImage };
