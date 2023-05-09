import './index.scss';
import {
  TextControl,
  Flex,
  FlexBlock,
  FlexItem,
  Button,
  Icon,
  PanelBody,
  PanelRow,
  ColorPicker,
} from '@wordpress/components';
import {
  InspectorControls,
  BlockControls,
  AlignmentToolbar,
} from '@wordpress/block-editor';
import { ChromePicker } from 'react-color';

(function () {
  let locked = false;

  wp.data.subscribe(function () {
    const results = wp.data
      .select('core/block-editor')
      .getBlocks()
      .filter(function (block) {
        return (
          block.name == 'ourplugin/are-you-paying-attention' &&
          block.attributes.correctAnswer == undefined
        );
      });

    if (results.length && locked == false) {
      locked = true;
      wp.data.dispatch('core/editor').lockPostSaving('noanswer');
    }

    if (!results.length && locked) {
      locked = false;
      wp.data.dispatch('core/editor').unlockPostSaving('noanswer');
    }
  });
})();

wp.blocks.registerBlockType('ourplugin/are-you-paying-attention', {
  title: 'Are You Paying Attention?',
  icon: 'smiley',
  category: 'common',
  attributes: {
    question: { type: 'string' },
    answers: { type: 'array', default: [''] },
    correctAnswer: { type: 'number', default: undefined },
    bgColor: { type: 'string', default: '#EBEBEB' },
    theAlignment: { type: 'string', default: 'left' },
  },
  description: 'Give your audience a chance to prove their comprehension.',
  example: {
    attributes: {
      question: 'What is my name?',
      correctAnswer: 3,
      answers: ['Meowsalot', 'Barksalot', 'Purrsloud', 'Brad'],
      theAlignment: 'center',
      bgColor: '#CFE8F1',
    },
  },
  edit: EditComponent,
  save: function (props) {
    return null;
  },
});

function EditComponent(props) {
  function updateQuestion(value) {
    props.setAttributes({ question: value });
  }

  function deleteAnswer(indexToDelete) {
    const newAnswers = props.attributes.answers.filter(function (x, index) {
      return index != indexToDelete;
    });
    props.setAttributes({ answers: newAnswers });

    if (indexToDelete == props.attributes.correctAnswer) {
      props.setAttributes({ correctAnswer: undefined });
    }
  }

  function markAsCorrect(index) {
    props.setAttributes({ correctAnswer: index });
  }

  return (
    <div
      className='paying-attention-edit-block'
      style={{ backgroundColor: props.attributes.bgColor }}
    >
      <BlockControls>
        <AlignmentToolbar
          value={props.attributes.theAlignment}
          onChange={(x) => props.setAttributes({ theAlignment: x })}
        />
      </BlockControls>
      <InspectorControls>
        <PanelBody title='Background Color' initialOpen={true}>
          <PanelRow>
            <ChromePicker
              color={props.attributes.bgColor}
              onChangeComplete={(x) => props.setAttributes({ bgColor: x.hex })}
              disableAlpha={true}
            />

            {/* <ChromePicker color={props.attributes.bgColor} onChangeComplete={x => props.setAttributes({bgColor: x.hex})} disableAlpha={true} /> */}
          </PanelRow>
        </PanelBody>
      </InspectorControls>
      <TextControl
        label='Question:'
        value={props.attributes.question}
        onChange={updateQuestion}
        style={{ fontSize: '20px' }}
      />
      <p style={{ fontSize: '13px', margin: '20px 0 8px 0' }}>Answers:</p>
      {props.attributes.answers.map(function (answer, index) {
        return (
          <Flex>
            <FlexBlock>
              <TextControl
                value={answer}
                onChange={(newValue) => {
                  const newAnswers = props.attributes.answers.concat([]);
                  newAnswers[index] = newValue;
                  props.setAttributes({ answers: newAnswers });
                }}
              />
            </FlexBlock>
            <FlexItem>
              <Button onClick={() => markAsCorrect(index)}>
                <Icon
                  className='mark-as-correct'
                  icon={
                    props.attributes.correctAnswer == index
                      ? 'star-filled'
                      : 'star-empty'
                  }
                />
              </Button>
            </FlexItem>
            <FlexItem>
              <Button
                isLink
                className='attention-delete'
                onClick={() => deleteAnswer(index)}
              >
                Delete
              </Button>
            </FlexItem>
          </Flex>
        );
      })}
      <Button
        isPrimary
        onClick={() => {
          props.setAttributes({
            answers: props.attributes.answers.concat(['']),
          });
        }}
      >
        Add another answer
      </Button>
    </div>
  );
}

// The code you provided with the wp.blocks.registerBlockType function is for creating a custom block in the WordPress editor. It does not directly handle the saving of user input data to the database.

// However, the setAttributes function is used to update the block's attributes with the new values provided by the user. When the user saves the post containing the block, the block's attributes are saved to the post's content in the database.

// The actual saving of data to the database is handled by WordPress core and is done automatically when the user saves the post. The data is stored in the wp_posts table, which contains all the posts in the WordPress site, including posts with custom blocks created using the registerBlockType function.

// The code provided is for creating a custom block in the WordPress editor using the wp.blocks.registerBlockType function. This function registers a block type with WordPress and specifies how the block should be rendered in the editor.

// The block type created in this code is called "ourplugin/are-you-paying-attention" and it has a title, an icon, a category, and three attributes: question, answers, and correctAnswer. The edit function specifies how the block should be rendered in the editor when it's being edited by the user. The save function specifies how the block should be rendered when it's saved to the database.

// The EditComponent function is used to render the block in the editor. It contains form elements for editing the block's attributes and updating their values. When the user changes an attribute value, the setAttributes function is used to update the block's attributes with the new values.

// The code also contains a wp.data.subscribe function that listens for changes to the block's attributes and locks/unlocks the post saving button depending on whether the block has any unanswered questions or not. This helps prevent users from accidentally publishing a post that contains an unfinished block.

// Finally, the code imports several components from the WordPress Components library, such as TextControl, Flex, FlexBlock, FlexItem, Button, and Icon, which are used to create the user interface for the custom block in the editor.
