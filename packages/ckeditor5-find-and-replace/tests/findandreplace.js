import DecoupledEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import FindAndReplace from '../src/findandreplace';
import FindAndReplaceUI from '../src/findandreplaceui';
import FindAndReplaceEditing from '../src/findandreplaceediting';

describe( 'FindAndReplace', () => {
	// Data with 8 blocks that can contain $text.
	const LONG_TEXT =
    '<p>Cupcake ipsum dolor sit amet biscuit icing bears candy. Liquorice biscuit brownie croissant.</p>' +
    '<p>Danish toffee chupa chups liquorice jujubes gummi bears bears candy icing chupa chups. Lemon drops tiramisu muffin.</p>' +
    '<p>Chocolate bar ice cream topping marzipan. Powder gingerbread bear claw tootsie roll lollipop marzipan icing bonbon.</p>' +
    '<p>Chupa chups jelly beans halvah ice cream gingerbread bears candy halvah gummi bears. Cake dragée dessert chocolate.</p>' +
    '<p>Candy canes lemon drops wafer gummi bears biscuit tiramisu candy canes toffee powder.</p>' +
    '<p>Dessert lemon drops lollipop caramels brownie jelly liquorice marshmallow powder. Dessert tart toffee.</p>' +
    '<p>Dragée soufflé sesame snaps lollipop bonbon ice cream gummies jelly beans tootsie roll.</p>' +
    '<p>Chocolate cake fruitcake lollipop. Lemon drops sweet sweet roll lollipop toffee lollipop marzipan.</p>';

	const FOO_BAR_PARAGRAPH = '<p>Foo bar baz</p>';
	const TWO_FOO_BAR_PARAGRAPHS = FOO_BAR_PARAGRAPH + FOO_BAR_PARAGRAPH;

	let editor;
	let model;
	let root;
	let findAndReplaceUI;
	let findAndReplaceEditing;

	beforeEach( async () => {
		editor = await DecoupledEditor.create( '', {
			plugins: [ Essentials, Paragraph, BoldEditing, FindAndReplace, FindAndReplaceUI, FindAndReplaceEditing ]
		} );

		model = editor.model;
		root = model.document.getRoot();

		findAndReplaceEditing = editor.plugins.get( 'FindAndReplaceEditing' );
		findAndReplaceUI = editor.plugins.get( 'FindAndReplaceUI' );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	describe( 'findAndReplaceUI listeners', () => {
		it( 'should trigger findNext event', () => {
			const spy = sinon.spy();

			findAndReplaceUI.on( 'findNext', spy );

			findAndReplaceUI.fire( 'findNext', { searchText: 'test' } );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger findPrev event', () => {
			const spy = sinon.spy();

			findAndReplaceUI.on( 'findPrev', spy );

			findAndReplaceUI.fire( 'findPrev', { searchText: 'test' } );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should trigger replace command', () => {
			const replaceCommandSpy = sinon.spy( editor.commands.get( 'replace' ), 'execute' );
			editor.setData( TWO_FOO_BAR_PARAGRAPHS );
			const [ firstResult ] = findAndReplaceEditing.find( 'bar' );

			findAndReplaceUI.fire( 'replace', { marker: firstResult, searchText: 'bar', replaceText: 'test' } );

			replaceCommandSpy.restore();

			expect( replaceCommandSpy.calledOnce ).to.true;
			sinon.assert.calledWithExactly( replaceCommandSpy, 'test', firstResult );
		} );

		it( 'should trigger replaceAll event', () => {
			const spy = sinon.spy();

			findAndReplaceUI.on( 'replaceAll', spy );

			findAndReplaceUI.fire( 'replaceAll', { searchText: 'test', replaceText: 'find' } );

			expect( spy.calledOnce ).to.true;
		} );

		it( 'should react to closed ui dropdown event', () => {
			const spy = sinon.spy( findAndReplaceEditing, 'stop' );

			findAndReplaceUI.fire( 'dropdown:closed' );
			spy.restore();

			expect( spy.calledOnce ).to.true;
		} );
	} );

	describe( 'integration', () => {
		describe( 'subsequent findNext events', () => {
			it( 'causes just a findNext command call', () => {
				// The first call, it will call different logic.
				findAndReplaceUI.fire( 'findNext', { searchText: 'test' } );

				const findSpy = getCommandExecutionSpy( 'find' );
				const findNextSpy = getCommandExecutionSpy( 'findNext' );

				// Second call (only if the search text remains the same) should just move the highlight.
				findAndReplaceUI.fire( 'findNext', { searchText: 'test' } );

				sinon.assert.callCount( findSpy, 0 );
				sinon.assert.callCount( findNextSpy, 1 );
			} );
		} );

		describe( 'subsequent findPrev events', () => {
			it( 'causes just a findPrev command call', () => {
				// The first call, it will call different logic.
				findAndReplaceUI.fire( 'findPrev', { searchText: 'test' } );

				const findSpy = getCommandExecutionSpy( 'find' );
				const findPrevSpy = getCommandExecutionSpy( 'findPrevious' );

				// Second call (only if the search text remains the same) should just move the highlight.
				findAndReplaceUI.fire( 'findPrev', { searchText: 'test' } );

				sinon.assert.callCount( findSpy, 0 );
				sinon.assert.callCount( findPrevSpy, 1 );
			} );
		} );

		describe( 'replace', () => {
			it( 'works with in with the typical use case', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'bar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).to.equal(
					'<p>Foo new baz</p>' +
					'<p>Foo bar baz</p>'
				);
			} );

			it( 'doesn\'t crash when nothing was matched', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'baaar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).to.equal(
					'<p>Foo bar baz</p>' +
					'<p>Foo bar baz</p>'
				);
			} );

			it( 'skips extra search if same search has already been performed', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'findNext', {
					searchText: 'baz'
				} );

				findAndReplaceUI.fire( 'replace', {
					searchText: 'baz',
					replaceText: 'new'
				} );

				expect( editor.getData() ).to.equal(
					'<p>Foo bar new</p>' +
					'<p>Foo bar baz</p>'
				);
			} );
		} );

		describe( 'replace all', () => {
			it( 'is performed based on event from UI', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'replaceAll', {
					searchText: 'bar',
					replaceText: 'new'
				} );

				expect( editor.getData() ).to.equal(
					'<p>Foo new baz</p>' +
					'<p>Foo new baz</p>'
				);
			} );

			it( 'skips extra search if same search has already been performed', () => {
				editor.setData( TWO_FOO_BAR_PARAGRAPHS );

				findAndReplaceUI.fire( 'findNext', {
					searchText: 'baz'
				} );

				findAndReplaceUI.fire( 'replaceAll', {
					searchText: 'baz',
					replaceText: 'new'
				} );

				expect( editor.getData() ).to.equal(
					'<p>Foo bar new</p>' +
					'<p>Foo bar new</p>'
				);
			} );
		} );
	} );

	describe( 'find()', () => {
		it( 'should return list of results', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults ).to.be.instanceOf( Collection );
			expect( findResults ).to.have.property( 'length', 6 );
		} );

		it( 'should return properly formatted result', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( 'bar' );

			const [ result ] = findResults;

			expect( result )
				.to.have.property( 'id' )
				.that.match( /^findResult:[a-f0-9]{33}$/ );
			expect( result ).to.have.property( 'label', 'bar' );
			expect( result ).to.have.property( 'marker' );

			const { marker } = result;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 4 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).to.equal( true );
		} );

		it( 'should update list of results on editor change (text insert)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults ).to.have.property( 'length', 6 );

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( findResults ).to.have.property( 'length', 7 );
		} );

		it( 'should update list of results on editor change (block with text insert)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults ).to.have.property( 'length', 6 );

			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const text = writer.createText( 'Foo bears foo' );
				writer.insert( text, paragraph, 0 );

				model.insertContent( paragraph, root, 0 );
			} );

			expect( findResults ).to.have.property( 'length', 7 );
		} );

		it( 'should update list of results on editor change (removed block)', () => {
			editor.setData( LONG_TEXT );

			const findResults = findAndReplaceEditing.find( 'bears' );

			expect( findResults ).to.have.property( 'length', 6 );

			model.change( writer => {
				writer.remove( root.getChild( 0 ) );
			} );

			expect( findResults ).to.have.property( 'length', 5 );
		} );

		it( 'should update list of results on editor change (changed text in marker)', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( 'bar' );

			expect( findResults ).to.have.property( 'length', 1 );

			model.change( writer => {
				model.insertContent( writer.createText( 'x' ), root.getChild( 0 ), 5 );
			} );

			expect( findResults ).to.have.property( 'length', 0 );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>Foo bxar baz</p>' );
		} );

		it( 'should find result in any element that allows $text inside', () => {
			model.schema.register( 'test', {
				inheritAllFrom: '$block'
			} );
			editor.conversion.elementToElement( { model: 'test', view: 'test' } );
			editor.setData( '<test>Foo bar baz</test>' );

			const findResults = findAndReplaceEditing.find( 'bar' );
			expect( findResults ).to.have.property( 'length', 1 );
		} );

		it( 'should insert marker for a find result', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			findAndReplaceEditing.find( 'bar' );

			const markers = [ ...model.markers.getMarkersGroup( 'findResult' ) ];

			expect( markers ).to.have.length( 1 );

			const [ marker ] = markers;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 4 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).to.equal( true );
		} );

		it( 'should call a callback for each block with text inside', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = sinon.spy();

			findAndReplaceEditing.find( callbackSpy );

			sinon.assert.callCount( callbackSpy, 8 );
		} );

		it( 'should call a callback only for blocks which allows text', () => {
			model.schema.register( 'test', {
				inheritAllFrom: '$block'
			} );
			model.schema.register( 'disallowed', {
				allowIn: '$root'
			} );
			editor.conversion.elementToElement( { model: 'test', view: 'test' } );
			editor.conversion.elementToElement( { model: 'disallowed', view: 'disallowed' } );

			editor.setData( '<p>Foo bar baz</p><test>Foo bar baz</test><disallowed></disallowed>' );

			const callbackSpy = sinon.spy();

			findAndReplaceEditing.find( callbackSpy );

			expect( callbackSpy.callCount ).to.equal( 2 );
		} );

		it( 'should call a callback for changed blocks', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = sinon.spy();
			findAndReplaceEditing.find( callbackSpy );
			callbackSpy.resetHistory();

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( callbackSpy.callCount ).to.equal( 1 );
		} );

		it( 'should handle custom callback return value', () => {
			editor.setData( FOO_BAR_PARAGRAPH );

			const findResults = findAndReplaceEditing.find( () => {
				return [
					{
						label: 'XXX',
						start: 0,
						end: 7
					}
				];
			} );

			expect( findResults ).to.have.length( 1 );
			const [ result ] = findResults;

			expect( result ).to.have.property( 'label', 'XXX' );
			expect( result ).to.have.property( 'marker' );

			const { marker } = result;

			const paragraph = root.getChild( 0 );
			const rangeOnBar = model.createRange( model.createPositionAt( paragraph, 0 ), model.createPositionAt( paragraph, 7 ) );

			expect( marker.getRange().isEqual( rangeOnBar ) ).to.equal( true );
		} );

		it( 'should handle soft breaks in text', () => {
			editor.setData( '<p>Foo<br>bar<br>baz</p>' );

			const paragraph = root.getChild( 0 );
			const spy = sinon.spy();

			findAndReplaceEditing.find( spy );

			sinon.assert.calledWith( spy, sinon.match( { text: 'Foo\nbar\nbaz' } ) );
			sinon.assert.calledWith( spy, sinon.match.has( 'item', sinon.match.same( paragraph ) ) );
		} );
	} );

	describe( 'stop()', () => {
		it( 'should not throw if no active results', () => {
			expect( () => findAndReplaceEditing.stop() ).to.not.throw();
		} );

		it( 'should remove all markers', () => {
			editor.setData( LONG_TEXT );

			findAndReplaceEditing.find( 'bears' );

			expect( [ ...model.markers.getMarkersGroup( 'findResult' ) ] ).to.have.length( 6 );

			findAndReplaceEditing.stop();

			expect( [ ...model.markers.getMarkersGroup( 'findResult' ) ] ).to.have.length( 0 );
		} );

		it( 'should stop listening to document changes', () => {
			editor.setData( LONG_TEXT );

			const callbackSpy = sinon.spy();
			findAndReplaceEditing.find( callbackSpy );
			callbackSpy.resetHistory();

			findAndReplaceEditing.stop();

			model.change( writer => {
				model.insertContent( writer.createText( 'Foo bears foo' ), root.getChild( 0 ), 0 );
			} );

			expect( callbackSpy.callCount ).to.equal( 0 );
		} );
	} );

	function getCommandExecutionSpy( commandName ) {
		const spy = sinon.spy();
		editor.commands.get( commandName ).on( 'execute', spy );
		return spy;
	}
} );
