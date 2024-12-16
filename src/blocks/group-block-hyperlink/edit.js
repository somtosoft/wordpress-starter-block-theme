// import classnames from 'classnames';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useCallback, useState, useRef } from '@wordpress/element';
import {
	KeyboardShortcuts,
	TextControl,
	ToolbarButton,
	Popover,
	ToggleControl,
	PanelBody,
} from '@wordpress/components';
import { 
	InnerBlocks,
	useBlockProps,
	InspectorAdvancedControls,
	__experimentalUseInnerBlocksProps,
	useInnerBlocksProps as stableUseInnerBlocksProps,
	__experimentalLinkControl,
	LinkControl as stableLinkControl,
	store as blockEditorStore,
	BlockControls,
	InspectorControls,
} from '@wordpress/block-editor';
import { rawShortcut, displayShortcut } from '@wordpress/keycodes';
import { link, linkOff } from '@wordpress/icons';

export const useInnerBlocksProps = __experimentalUseInnerBlocksProps || stableUseInnerBlocksProps; // WP +5.9
export const LinkControl         = __experimentalLinkControl || stableLinkControl; // WP +5.9

const NEW_TAB_REL = 'noreferrer noopener';

export default function Edit({ attributes, setAttributes, isSelected, clientId }) {
	const {
		linkTarget,
		ariaLabel,
		rel,
		title,
		url,
	} = attributes;

	const { hasInnerBlocks } = useSelect(
		( select ) => {
			const { getBlock } = select( blockEditorStore );
			const block = getBlock( clientId );
			return {
				hasInnerBlocks: !!(block && block.innerBlocks.length),
			};
		},
		[ clientId ]
	);

	const ref = useRef();
	const blockProps = useBlockProps({ ref });
	const innerBlocksProps = useInnerBlocksProps(blockProps, {
		renderAppender: hasInnerBlocks
			? undefined
			: InnerBlocks.ButtonBlockAppender,
	});

	const onSetAriaLabel = useCallback(
		(value) => {
			setAttributes({ ariaLabel: value });
		},
		[setAttributes]
	);

	const onSetLinkRel = useCallback(
		(value) => {
			setAttributes({ rel: value });
		},
		[setAttributes]
	);

	const onSetLinkTitle = useCallback(
		(value) => {
			setAttributes({ title: value });
		},
		[setAttributes]
	);

	const onToggleOpenInNewTab = useCallback(
		(value) => {
			const newLinkTarget = value ? '_blank' : undefined;

			let updatedRel = rel;
			if (newLinkTarget && !rel) {
				updatedRel = NEW_TAB_REL;
			} else if (!newLinkTarget && rel === NEW_TAB_REL) {
				updatedRel = undefined;
			}

			setAttributes({
				linkTarget: newLinkTarget,
				rel: updatedRel,
			});
		},
		[rel, setAttributes]
	);

	function URLPicker({
		isSelected,
		url,
		setAttributes,
		opensInNewTab,
		onToggleOpenInNewTab,
		anchorRef,
	}) {
		const [isURLPickerOpen, setIsURLPickerOpen] = useState(false);
		const urlIsSet = !!url;
		const urlIsSetandSelected = urlIsSet && isSelected;
		const openLinkControl = () => {
			setIsURLPickerOpen(true);
			return false;
		};
		const unlinkButton = () => {
			setAttributes({
				url: undefined,
				linkTarget: undefined,
				rel: undefined,
			});
			setIsURLPickerOpen(false);
		};
		const linkControl = (isURLPickerOpen || urlIsSetandSelected) && (
			<Popover
				focusOnMount={false}
				position="bottom center"
				onClose={() => setIsURLPickerOpen(false)}
				anchorRef={anchorRef?.current}
			>
				<LinkControl
					className="wp-block-navigation-link__inline-link-input"
					value={{ url, opensInNewTab }}
					onChange={({ url: newURL = '', opensInNewTab: newOpensInNewTab }) => {
						setAttributes({ url: newURL });
						if (opensInNewTab !== newOpensInNewTab) {
							onToggleOpenInNewTab(newOpensInNewTab);
						}
					}}
				/>
			</Popover>
		);
		return (
			<>
				<BlockControls group="block">
					{!urlIsSet && (
						<ToolbarButton
							name="link"
							icon={link}
							title={__('Link')}
							shortcut={displayShortcut.primary('k')}
							onClick={openLinkControl}
						/>
					)}
					{urlIsSetandSelected && (
						<ToolbarButton
							name="link"
							icon={linkOff}
							title={__('Unlink')}
							shortcut={displayShortcut.primaryShift('k')}
							onClick={unlinkButton}
							isActive={true}
						/>
					)}
				</BlockControls>
				{isSelected && (
					<KeyboardShortcuts
						bindGlobal
						shortcuts={{
							[rawShortcut.primary('k')]: openLinkControl,
							[rawShortcut.primaryShift('k')]: unlinkButton,
						}}
					/>
				)}
				{linkControl}
			</>
		);
	}

	return (
		<>
			<div {...blockProps}  >
				<URLPicker
					url={url}
					setAttributes={setAttributes}
					isSelected={isSelected}
					opensInNewTab={linkTarget === '_blank'}
					onToggleOpenInNewTab={onToggleOpenInNewTab}
					anchorRef={ref}
				/>
				<InspectorAdvancedControls>
					<TextControl
						label={__('Link rel')}
						value={rel || ''}
						onChange={onSetLinkRel}
					/>
					<TextControl
						label={__('Aria-Label')}
						value={ariaLabel || ''}
						onChange={onSetAriaLabel}
					/>
					<TextControl
						label={__('Link title')}
						value={title || ''}
						onChange={onSetLinkTitle}
					/>
				</InspectorAdvancedControls>
				<a {...innerBlocksProps} />
			</div>
		</>
	);
}
