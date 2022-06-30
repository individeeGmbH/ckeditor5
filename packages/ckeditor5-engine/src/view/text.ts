/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/text
 */

import Node from './node';

import type AttributeElement from './attributeelement';
import type ContainerElement from './containerelement';
import type Document from './document';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type EditableElement from './editableelement';
import type Element from './element';
import type EmptyElement from './emptyelement';
import type Position from './position';
import type Range from './range';
import type RawElement from './rawelement';
import type RootEditableElement from './rooteditableelement';
import type Selection from './selection';
import type TextProxy from './textproxy';
import type UIElement from './uielement';

/**
 * Tree view text node.
 *
 * The constructor of this class should not be used directly. To create a new text node instance
 * use the {@link module:engine/view/downcastwriter~DowncastWriter#createText `DowncastWriter#createText()`}
 * method when working on data downcasted from the model or the
 * {@link module:engine/view/upcastwriter~UpcastWriter#createText `UpcastWriter#createText()`}
 * method when working on non-semantic views.
 *
 * @extends module:engine/view/node~Node
 */
export default class Text extends Node {
	private _textData: string;

	/**
	 * Creates a tree view text node.
	 *
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this text node belongs.
	 * @param {String} data The text's data.
	 */
	constructor( document: Document, data: string ) {
		super( document );

		/**
		 * The text content.
		 *
		 * Setting the data fires the {@link module:engine/view/node~Node#event:change:text change event}.
		 *
		 * @protected
		 * @member {String} module:engine/view/text~Text#_textData
		 */
		this._textData = data;
	}

	public override is( type: 'node' | 'view:node' ):
		this is
			Node | Element | AttributeElement | ContainerElement | EditableElement |
			EmptyElement | RawElement | RootEditableElement | UIElement;

	public override is( type: 'element' | 'view:element' ): this is Element;
	public override is( type: 'attributeElement' | 'view:attributeElement' ): this is AttributeElement;
	public override is( type: 'containerElement' | 'view:containerElement' ): this is ContainerElement;
	public override is( type: 'editableElement' | 'view:editableElement' ): this is EditableElement;
	public override is( type: 'emptyElement' | 'view:emptyElement' ): this is EmptyElement;
	public override is( type: 'rawElement' | 'view:rawElement' ): this is RawElement;
	public override is( type: 'rootElement' | 'view:rootElement' ): this is RootEditableElement;
	public override is( type: 'uiElement' | 'view:uiElement' ): this is UIElement;
	public override is( type: 'documentFragment' | 'view:documentFragment' ): this is DocumentFragment;
	public override is( type: '$text' | 'view:$text' ): this is Text;
	public override is( type: '$textProxy' | 'view:$textProxy' ): this is TextProxy;
	public override is( type: 'position' | 'view:position' ): this is Position;
	public override is( type: 'range' | 'view:range' ): this is Range;
	public override is( type: 'selection' | 'view:selection' ): this is Selection;
	public override is( type: 'documentSelection' | 'view:documentSelection' ): this is DocumentSelection;

	public override is<N extends string>( type: 'element' | 'view:element', name: N ):
		this is (
			Element | AttributeElement | ContainerElement | EditableElement | EmptyElement | RawElement | RootEditableElement | UIElement
		) & { name: N };
	public override is<N extends string>( type: 'attributeElement' | 'view:attributeElement', name: N ):
		this is ( AttributeElement ) & { name: N };
	public override is<N extends string>( type: 'containerElement' | 'view:containerElement', name: N ):
		this is ( ContainerElement ) & { name: N };
	public override is<N extends string>( type: 'editableElement' | 'view:editableElement', name: N ):
		this is ( EditableElement ) & { name: N };
	public override is<N extends string>( type: 'emptyElement' | 'view:emptyElement', name: N ):
		this is ( EmptyElement ) & { name: N };
	public override is<N extends string>( type: 'rawElement' | 'view:rawElement', name: N ):
		this is ( RawElement ) & { name: N };
	public override is<N extends string>( type: 'rootElement' | 'view:rootElement', name: N ):
		this is ( RootEditableElement ) & { name: N };
	public override is<N extends string>( type: 'uiElement' | 'view:uiElement', name: N ):
		this is ( UIElement ) & { name: N };

	/**
	 * Checks whether this object is of the given type.
	 *
	 *		text.is( '$text' ); // -> true
	 *		text.is( 'node' ); // -> true
	 *		text.is( 'view:$text' ); // -> true
	 *		text.is( 'view:node' ); // -> true
	 *
	 *		text.is( 'model:$text' ); // -> false
	 *		text.is( 'element' ); // -> false
	 *		text.is( 'range' ); // -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * **Note:** Until version 20.0.0 this method wasn't accepting `'$text'` type. The legacy `'text'` type is still
	 * accepted for backward compatibility.
	 *
	 * @param {String} type Type to check.
	 * @returns {Boolean}
	 */
	public override is( type: string ): boolean {
		return type === '$text' || type === 'view:$text' ||
			// This are legacy values kept for backward compatibility.
			type === 'text' || type === 'view:text' ||
			// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
			type === 'node' || type === 'view:node';
	}

	/**
	 * The text content.
	 *
	 * @readonly
	 * @type {String}
	 */
	public get data(): string {
		return this._textData;
	}

	/**
	 * The `_data` property is controlled by a getter and a setter.
	 *
	 * The getter is required when using the addition assignment operator on protected property:
	 *
	 *		const foo = downcastWriter.createText( 'foo' );
	 *		const bar = downcastWriter.createText( 'bar' );
	 *
	 *		foo._data += bar.data;   // executes: `foo._data = foo._data + bar.data`
	 *		console.log( foo.data ); // prints: 'foobar'
	 *
	 * If the protected getter didn't exist, `foo._data` will return `undefined` and result of the merge will be invalid.
	 *
	 * The setter sets data and fires the {@link module:engine/view/node~Node#event:change:text change event}.
	 *
	 * @protected
	 * @type {String}
	 */
	public get _data(): string {
		return this.data;
	}

	public set _data( data: string ) {
		this._fireChange( 'text', this );

		this._textData = data;
	}

	/**
	 * Checks if this text node is similar to other text node.
	 * Both nodes should have the same data to be considered as similar.
	 *
	 * @param {module:engine/view/node~Node} otherNode Node to check if it is same as this node.
	 * @returns {Boolean}
	 */
	public isSimilar( otherNode: Node ): boolean {
		if ( !( otherNode instanceof Text ) ) {
			return false;
		}

		return this === otherNode || this.data === otherNode.data;
	}

	/**
	 * Clones this node.
	 *
	 * @protected
	 * @returns {module:engine/view/text~Text} Text node that is a clone of this node.
	 */
	private _clone(): Text {
		return new Text( this.document, this.data );
	}

	// @if CK_DEBUG_ENGINE // toString() {
	// @if CK_DEBUG_ENGINE // 	return `#${ this.data }`;
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // log() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }

	// @if CK_DEBUG_ENGINE // logExtended() {
	// @if CK_DEBUG_ENGINE // 	console.log( 'ViewText: ' + this );
	// @if CK_DEBUG_ENGINE // }
}
