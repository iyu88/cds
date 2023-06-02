import Button from '@components/Button';
import Flexbox from '@components-layout/Flexbox';
import { expect } from '@storybook/jest';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { queryByAttribute, fireEvent } from '@storybook/testing-library';
import { MdCelebration } from 'react-icons/md';


import Slider from '.';

export default {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'fullscreen',
    componentSubtitle:
      'Slider는 HTML의 <input type="range">처럼 슬라이더를 조절하여 값을 얻을 수 있는 컴포넌트입니다.',
    docs: {
      description: {
        component: `- 다음과 같은 컴포넌트를 children으로 사용할 수 있습니다.  
        - \\<Slider.Track> : \\<Slider.Thumb\\>가 위치할 수 있는 수직 혹은 수평선입니다. 
        - \\<Slider.Filled> : \\<Slider\\> 값만큼 \\<Slider.Track\\>의 높이 혹은 너비를 채웁니다.
        - \\<Slider.Thumb> : \\<Slider\\>의 값을 마우스 혹은 키보드로 조절할 수 있는 컨트롤러입니다. 
        `,
      },
    },
  },
  argTypes: {
    label: {
      description: '고유한 값으로 접근성 속성에 사용됩니다.',
      table: {
        type: { summary: 'string', required: true },
      },
      control: {
        type: 'text',
      },
    },
    min: {
      description: '최소값을 설정합니다.',
      table: {
        type: { summary: 'number', required: true },
      },
      control: {
        type: 'number',
      },
    },
    max: {
      description: '최대값을 설정합니다.',
      table: {
        type: { summary: 'number', required: true },
      },
      control: {
        type: 'number',
      },
    },
    defaultValue: {
      description: '초기 슬라이드 값을 설정합니다.',
      table: {
        type: { summary: 'number', required: true },
      },
      control: {
        type: 'number',
      },
    },
    size: {
      description: '<Slider.Track> 길이를 설정합니다.',
      table: {
        type: { summary: `CSSProperties['width']` },
        defaultValue: { summary: '100%' },
      },
      control: {
        type: 'text',
      },
    },
    step: {
      description:
        '<Slider.Thumb>가 1회 이동할 때 변경되는 \\<Slider> 값을 설정합니다.',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: 1 },
      },
      control: {
        type: 'number',
      },
    },
    orientation: {
      description: '\\<Slider>의 방향을 결정합니다.',
      table: {
        type: { summary: 'horizontal | vertical' },
        defaultValue: { summary: 'horizontal' },
      },
      control: {
        type: 'radio',
        options: ['horizontal', 'vertical'],
      },
    },
    color: {
      description: '각 하위 컴포넌트의 색상을 설정합니다.',
      table: {
        type: { summary: 'string' },
        category: ['Slider.Track', 'Slider.Filled', 'Slider.Thumb'],
      },
    },
  },
  decorators: [
    (Story) => (
      <Flexbox
        justifyContent={'center'}
        alignItems={'center'}
        style={{
          height: '250px',
          padding: '50px',
        }}
      >
        {Story()}
      </Flexbox>
    ),
  ],
} as ComponentMeta<typeof Slider>;

const DEFAULT_LABEL = 'cds_Slider';
const DEFAULT_PROPS = {
  label: DEFAULT_LABEL,
  min: 0,
  max: 100,
  defaultValue: 50,
};

const SLIDER_PREFIX = 'cds_Slider-slider';
const TRACK_ID = `${SLIDER_PREFIX}-track`;
const THUMB_ID = `${SLIDER_PREFIX}-thumb`;

const getById = queryByAttribute.bind(null, 'id');

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type EventName = 
  'mouseDown' 
  | 'mouseMove' 
  | 'mouseUp' 
  | 'keyDown' 
  | 'keyUp';

const simulateEvents = async (element: HTMLElement, eventName: EventName, options = {}) => {
  fireEvent[eventName](element, options);
  await sleep(0);
}

const assertDragEvent = async (target: HTMLElement, fromX: number, fromY: number, toX: number, toY: number, expectedValue: string) => {  
  await simulateEvents(target, 'mouseDown', { clientX: fromX, clientY: fromY });
  await simulateEvents(target, 'mouseMove', { clientX: toX, clientY: toY });
  await simulateEvents(target, 'mouseUp');
  expect(target.textContent).toEqual(expectedValue);
}

type KeyName = 
  'ArrowRight' 
  | 'ArrowUp' 
  | 'ArrowLeft' 
  | 'ArrowDown'
  | 'PageUp' 
  | 'PageDown' 
  | 'Home' 
  | 'End';

const assertKeyboardEvent = async (target: HTMLElement, keyName: KeyName, expectedValue: string) => {
  await simulateEvents(target, 'keyDown', { key: keyName });
  await simulateEvents(target, 'keyUp', { key: keyName });
  expect(target.textContent).toEqual(expectedValue);
}

const Template: ComponentStory<typeof Slider> = (args) => <Slider {...args} />;

export const Default = Template.bind({});
Default.args = { ...DEFAULT_PROPS };

Default.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);
  const track = getById(canvasElement, TRACK_ID);

  if (!thumb || !track) return;

  const {x, y} = thumb.getBoundingClientRect();
  const {left, right} = track.getBoundingClientRect();

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '51');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '52');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '51');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '50');

  // Increase with page up
  await assertKeyboardEvent(thumb, 'PageUp', '60');
  // Decrease with page down
  await assertKeyboardEvent(thumb, 'PageDown', '50');
  // Set min with home key
  await assertKeyboardEvent(thumb, 'Home', '0');
  // Set max with end key
  await assertKeyboardEvent(thumb, 'End', '100');

  // Click min value
  await assertDragEvent(thumb, x, y, left, y, '0');
  // Click max value
  await assertDragEvent(thumb, x, y, right, y, '100');
};

export const OnlySlider = Template.bind({});
OnlySlider.args = { ...DEFAULT_PROPS };

OnlySlider.parameters = {
  docs: {
    storyDescription:
      '하위 컴포넌트 없이 \\<Slider> 만으로도 사용할 수 있습니다.',
  },
};

export const StartFromZero = Template.bind({});
StartFromZero.args = { ...DEFAULT_PROPS, defaultValue: 0 };

StartFromZero.parameters = {
  docs: {
    storyDescription: 'defaultValue을 min과 동일하게 설정합니다.',
  },
};

StartFromZero.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);

  if (!thumb) return;

  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '0');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '0');

  // Decrease with page down
  await assertKeyboardEvent(thumb, 'PageDown', '0');
};

export const StartFromEnd = Template.bind({});
StartFromEnd.args = { ...DEFAULT_PROPS, defaultValue: 100 };

StartFromEnd.parameters = {
  docs: {
    storyDescription: 'defaultValue을 max와 동일하게 설정합니다.',
  },
};

StartFromEnd.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);

  if (!thumb) return;

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '100');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '100');

  // Increase with page up
  await assertKeyboardEvent(thumb, 'PageUp', '100');
};

export const MinValueVariant = Template.bind({});
MinValueVariant.args = { ...DEFAULT_PROPS, min: 50, defaultValue: 75 };

MinValueVariant.parameters = {
  docs: {
    storyDescription: '최소값을 0이 아닌 값으로 설정할 수 있습니다.',
  },
};

MinValueVariant.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);
  const track = getById(canvasElement, TRACK_ID);

  if (!thumb || !track) return;

  const {x, y} = thumb.getBoundingClientRect();
  const {left, right} = track.getBoundingClientRect();

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '76');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '77');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '76');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '75');

  // Increase with page up
  await assertKeyboardEvent(thumb, 'PageUp', '80');
  // Decrease with page down
  await assertKeyboardEvent(thumb, 'PageDown', '75');
  // Set min with home key
  await assertKeyboardEvent(thumb, 'Home', '50');
  // Set max with end key
  await assertKeyboardEvent(thumb, 'End', '100');

  // Click min value
  await assertDragEvent(thumb, x, y, left, y, '50');
  // Click max value
  await assertDragEvent(thumb, x, y, right, y, '100');
};

export const MaxValueVariant = Template.bind({});
MaxValueVariant.args = {
  label: DEFAULT_LABEL,
  min: 50,
  max: 200,
  defaultValue: 100,
};

MaxValueVariant.parameters = {
  docs: {
    storyDescription: '최대값을 100이 아닌 값으로 설정할 수 있습니다.',
  },
};

MaxValueVariant.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);
  const track = getById(canvasElement, TRACK_ID);

  if (!thumb || !track) return;

  const {x, y} = thumb.getBoundingClientRect();
  const {left, right} = track.getBoundingClientRect();

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '101');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '102');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '101');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '100');

  // Increase with page up
  await assertKeyboardEvent(thumb, 'PageUp', '115');
  // Decrease with page down
  await assertKeyboardEvent(thumb, 'PageDown', '100');
  // Set min with home key
  await assertKeyboardEvent(thumb, 'Home', '50');
  // Set max with end key
  await assertKeyboardEvent(thumb, 'End', '200');

  // Click min value
  await assertDragEvent(thumb, x, y, left, y, '50');
  // Click max value
  await assertDragEvent(thumb, x, y, right, y, '200');
};

export const SizeVariant = Template.bind({});
SizeVariant.args = { ...DEFAULT_PROPS, size: 500 };

SizeVariant.parameters = {
  docs: {
    storyDescription: 'size를 px 단위로 하여 너비/높이를 결정합니다.',
  },
};

export const WithStep10 = Template.bind({});
WithStep10.args = { ...DEFAULT_PROPS, step: 10 };

WithStep10.parameters = {
  docs: {
    storyDescription:
      'step 속성을 10으로 설정하여 <Slider.Thumb>가 1회 이동할 때 \\<Slider> 값이 10씩 변경됩니다.',
  },
};

WithStep10.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);

  if (!thumb ) return;

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '60');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '70');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '60');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '50');
};

export const WithStep20 = Template.bind({});
WithStep20.args = { ...DEFAULT_PROPS, step: 20 };

WithStep20.parameters = {
  docs: {
    storyDescription:
      'step 속성을 20으로 설정하여 <Slider.Thumb>가 1회 이동할 때 \\<Slider> 값이 20씩 변경됩니다.',
  },
};

WithStep20.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);

  if (!thumb ) return;

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '70');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '90');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '70');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '50');
};

export const WithVerticalOrientation = Template.bind({});
WithVerticalOrientation.args = { ...DEFAULT_PROPS, orientation: 'vertical' };

WithVerticalOrientation.parameters = {
  docs: {
    storyDescription:
      'orientation 속성을 vertical로 명시하면 <Slider.Track>의 방향이 세로로 설정됩니다. 다른 모든 속성들이 동일하게 적용됩니다. ',
  },
};

WithVerticalOrientation.play = async ({ canvasElement }) => {
  const thumb = getById(canvasElement, THUMB_ID);
  const track = getById(canvasElement, TRACK_ID);

  if (!thumb || !track) return;

  const {x, y} = thumb.getBoundingClientRect();
  const {bottom, top} = track.getBoundingClientRect();

  // Increase with right arrow
  await assertKeyboardEvent(thumb, 'ArrowRight', '51');
  // Increase with up arrow
  await assertKeyboardEvent(thumb, 'ArrowUp', '52');
  // Decrease with left arrow
  await assertKeyboardEvent(thumb, 'ArrowLeft', '51');
  // Decrease with down arrow
  await assertKeyboardEvent(thumb, 'ArrowDown', '50');

  // Increase with page up
  await assertKeyboardEvent(thumb, 'PageUp', '60');
  // Decrease with page down
  await assertKeyboardEvent(thumb, 'PageDown', '50');
  // Set min with home key
  await assertKeyboardEvent(thumb, 'Home', '0');
  // Set max with end key
  await assertKeyboardEvent(thumb, 'End', '100');

  // Click min value
  await assertDragEvent(thumb, x, y, x, bottom, '0');
  // Click max value
  await assertDragEvent(thumb, x, y, x, top, '100');
};

const ColorTemplate: ComponentStory<typeof Slider> = (args) => (
  <Slider {...args}>
    <Slider.Track color={'thistle'}>
      <Slider.Filled color={'slateblue'} />
    </Slider.Track>
    <Slider.Thumb color={'slateblue'} />
  </Slider>
);

export const WithCustomColor = ColorTemplate.bind({});
WithCustomColor.args = { ...DEFAULT_PROPS };

WithCustomColor.parameters = {
  docs: {
    storyDescription:
      '<Slider.Track>, <Slider.Filled>, <Slider.Thumb> 컴포넌트에 color 값을 명시적으로 설정할 수 있습니다.',
  },
};

const ThumbTemplate: ComponentStory<typeof Slider> = (args) => (
  <Slider {...args}>
    <Slider.Track>
      <Slider.Filled />
    </Slider.Track>
    <Slider.Thumb>
      <Button variant="round" label="Slider Thumb">
        <MdCelebration />
      </Button>
    </Slider.Thumb>
  </Slider>
);

export const WithCustomThumb = ThumbTemplate.bind({});
WithCustomThumb.args = { ...DEFAULT_PROPS };

WithCustomThumb.parameters = {
  docs: {
    storyDescription:
      '<Slider.Thumb> 컴포넌트에 children prop으로 전달하는 노드를 Thumb로 사용할 수 있습니다.',
  },
};
