/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import TableSelection from '@ckeditor/ckeditor5-table/src/tableselection';
import TableClipboard from '@ckeditor/ckeditor5-table/src/tableclipboard';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption';

import TableColumnResize from '../../src/tablecolumnresize';

const editorConfig = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableCaption,
		TableColumnResize
	],
	toolbar: [
		'heading', '|',
		'insertTable', '|',
		'bold', 'italic', 'link', '|',
		'bulletedList', 'numberedList', 'blockQuote', '|',
		'undo', 'redo'
	],
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'toggleTableCaption'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor' ), editorConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );