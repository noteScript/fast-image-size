import { Buffer } from 'https://cdn.deno.land/std/versions/0.68.0/raw/node/buffer.ts';

export interface RetInfo {
	type?: 'gif' | 'jpeg' | 'png' | 'bmp' | 'unknown',
	width?: number,
	height?: number,
	image?: string,
}

function getJpgSize( buffer_data: Buffer ): {
	height: number,
	width: number
} | void {
	// Skip 5 chars, they are for signature
	buffer_data = buffer_data.slice( 4 );

	let i: number, next: number;
	while (buffer_data.length) {
		// read length of the next block
		i = buffer_data.readUInt16BE( 0 );

		// 0xFFC0 is baseline(SOF)
		// 0xFFC2 is progressive(SOF2)
		next = buffer_data[ i + 1 ];
		if (next === 0xC0 || next === 0xC2) {
			return {
				'height' : buffer_data.readUInt16BE( i + 5 ),
				'width' : buffer_data.readUInt16BE( i + 7 )
			};
		}

		// move to the next block
		buffer_data = buffer_data.slice( i + 2 );
	}
}

function parseHeaderData ( buffer_data: Buffer ): RetInfo {
	const retInfo: RetInfo = {};

	switch (true){
		case buffer_data[0] == 0x47 && buffer_data[1] == 0x49 && buffer_data[2] == 0x46:
			retInfo.type = 'gif';
			retInfo.width = (buffer_data[7] * 256) + buffer_data[6];
			retInfo.height = (buffer_data[9] * 256) + buffer_data[8];
			break;
		case  buffer_data[0] == 0xFF && buffer_data[1] == 0xD8 && buffer_data[2] == 0xFF && buffer_data[3] == 0xE0:
			retInfo.type = 'jpeg';
			const size = getJpgSize( buffer_data );
			retInfo.width = typeof size === 'object' ? size.width : 0;
			retInfo.height = typeof size === 'object' ? size.height : 0;
			break;
		case buffer_data[0] == 137 && buffer_data[1] == 80 && buffer_data[2] == 78 && buffer_data[3] == 71 && buffer_data[4] == 13 && buffer_data[5] == 10 && buffer_data[6] == 26 && buffer_data[7] == 10:
			retInfo.type = 'png';

			if ( buffer_data[12] == 0x49 && buffer_data[13] == 0x48 && buffer_data[14] == 0x44 && buffer_data[15] == 0x52 ) {
				retInfo.width = (buffer_data[16] * 256 * 256 * 256) + (buffer_data[17] * 256 * 256) + (buffer_data[18] * 256) + buffer_data[19];
				retInfo.height = (buffer_data[20] * 256 * 256 * 256) + (buffer_data[21] * 256 * 256) + (buffer_data[22] * 256) + buffer_data[23];
			} // Endif.
			break;
		case buffer_data[0] == 0x42 && buffer_data[1] == 0x4D:
			retInfo.type = 'bmp';
			retInfo.width = (buffer_data[21] * 256 * 256 * 256) + (buffer_data[20] * 256 * 256) + (buffer_data[19] * 256) + buffer_data[18];
			retInfo.height = (buffer_data[25] * 256 * 256 * 256) + (buffer_data[24] * 256 * 256) + (buffer_data[23] * 256) + buffer_data[22];
			break;
		default:
			retInfo.type = 'unknown'
			break;
	}

	return retInfo;
}

export default ( file_path: string ): RetInfo => ({
	...parseHeaderData(Buffer.from(Deno.readFileSync(file_path))),
	image: file_path,
});
