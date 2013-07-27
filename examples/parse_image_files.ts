import fast_image_size, { RetInfo } from '../mod.ts';
import * as path from 'https://deno.land/std/path/mod.ts';

const __dirname: string = path.dirname(import.meta.url);
const imagesList: string[] = [ 'example1.jpg', 'example2.gif', 'example3.gif', 'example4.png', 'example5.png', 'example6.png', 'example7.jpg', 'example8.jpg', 'example9.jpg' ];

function testImage ( image_file: string ) {
	const ret_data: RetInfo = fast_image_size(new URL(path.resolve('examples', image_file), __dirname).pathname);

	console.log ( 'Testing: ' + image_file );
	console.log ( 'Type: ' + ret_data.type );
	console.log ( 'Image width: ' + ret_data.width );
	console.log ( 'Image height: ' + ret_data.height );

	const ret_obj: RetInfo = fast_image_size(new URL(path.resolve('examples', image_file), __dirname).pathname);
	console.log ( 'Testing: ' + ret_obj.image );
	console.log ( 'Type: ' + ret_obj.type );
	console.log ( 'Image width: ' + ret_obj.width );
	console.log ( 'Image height: ' + ret_obj.height );
}

imagesList.forEach((image: string): void => testImage(image));

