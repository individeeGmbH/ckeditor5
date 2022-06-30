/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/rawelement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';

import type AttributeElement from './attributeelement';
import type ContainerElement from './containerelement';
import type DocumentFragment from './documentfragment';
import type DocumentSelection from './documentselection';
import type EditableElement from './editableelement';
import type EmptyElement from './emptyelement';
import type Node from './node';
import type Position from './position';
import type Range from './range';
import type RootEditableElement from './rooteditableelement';
import type Selection from './selection';
import type Text from './text';
import type TextProxy from './textproxy';
import type UIElement from './uielement';
import type DomConverter from './domconverter';

type DomElement = globalThis.HTMLElement;

/**
 * The raw element class.
 *
 * The raw elements work as data containers ("wrappers", "sandboxes") but their children are not managed or
 * even recognized by the editor. This encapsulation allows integrations to maintain custom DOM structures
 * in the editor content without, for instance, worrying about compatibility with other editor features.
 * Raw elements are a perfect tool for integration with external frameworks and data sources.
 *
 * Unlike {@link module:engine/view/uielement~UIElement UI elements}, raw elements act like real editor
 * content (similar to {@link module:engine/view/containerelement~ContainerElement} or
 * {@link module:engine/view/emptyelement~EmptyElement}), they are considered by the editor selection and
 * {@link module:widget/utils~toWidget they can work as widgets}.
 *
 * To create a new raw element, use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createRawElement `downcastWriter#createRawElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class RawElement extends Element {
	public readonly getFillerOffset: () => null;

	/**
	 * Creates a new instance of a raw element.
	 *
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} when the `children`
	 * parameter is passed to inform that the usage of `RawElement` is incorrect (adding child nodes to `RawElement` is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createRawElement
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name A node name.
	 * @param {Object|Iterable} [attrs] The collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into the created element.
	 */
	constructor( ...args: ConstructorParameters<typeof Element> ) {
		super( ...args );

		/**
		 * Returns `null` because filler is not needed for raw elements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
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
	 * Checks whether this object is of the given type or name.
	 *
	 *		rawElement.is( 'rawElement' ); // -> true
	 *		rawElement.is( 'element' ); // -> true
	 *		rawElement.is( 'node' ); // -> true
	 *		rawElement.is( 'view:rawElement' ); // -> true
	 *		rawElement.is( 'view:element' ); // -> true
	 *		rawElement.is( 'view:node' ); // -> true
	 *
	 *		rawElement.is( 'model:element' ); // -> false
	 *		rawElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is a raw element, you can also check its
	 * {@link module:engine/view/rawelement~RawElement#name name}:
	 *
	 *		rawElement.is( 'img' ); // -> true if this is an img element
	 *		rawElement.is( 'rawElement', 'img' ); // -> same as above
	 *		text.is( 'img' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type The type to check when the `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] The element name.
	 * @returns {Boolean}
	 */
	public override is( type: string, name?: string ): boolean {
		if ( !name ) {
			return type === 'rawElement' || type === 'view:rawElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'rawElement' || type === 'view:rawElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	/**
	 * Overrides the {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws the `view-rawelement-cannot-add` {@link module:utils/ckeditorerror~CKEditorError CKEditorError} to prevent
	 * adding any child nodes to a raw element.
	 *
	 * @protected
	 */
	public override _insertChild( index: number, items: any ): never {
		/**
		 * Cannot add children to a {@link module:engine/view/rawelement~RawElement} instance.
		 *
		 * @error view-rawelement-cannot-add
		 */
		throw new CKEditorError(
			'view-rawelement-cannot-add',
			[ this, items ]
		);
	}

	/**
	 * This allows rendering the children of a {@link module:engine/view/rawelement~RawElement} on the DOM level.
	 * This method is called by the {@link module:engine/view/domconverter~DomConverter} with the raw DOM element
	 * passed as an argument, leaving the number and shape of the children up to the integrator.
	 *
	 * This method **must be defined** for the raw element to work:
	 *
	 *		const myRawElement = downcastWriter.createRawElement( 'div' );
	 *
	 *		myRawElement.render = function( domElement, domConverter ) {
	 *			domConverter.setContentOf( domElement, '<b>This is the raw content of myRawElement.</b>' );
	 *		};
	 *
	 * @method #render
	 * @param {HTMLElement} domElement The native DOM element representing the raw view element.
	 * @param {module:engine/view/domconverter~DomConverter} domConverter Instance of the DomConverter used to optimize the output.
	 */
	public render( domElement?: DomElement, domConverter?: DomConverter ): void;
	public render(): void {}
}

// Returns `null` because block filler is not needed for raw elements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
