import React from 'react';

import { SortableQuestionTree } from './SortableQuestionTree';

export default {
  title: 'Examples/Tree/Sortable',
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      maxWidth: 600,
      padding: 10,
      margin: '0 auto',
      marginTop: '10%',
    }}
  >
    {children}
  </div>
);

export const AllFeatures = () => (
  <Wrapper>
    <SortableQuestionTree collapsible indicator removable />
  </Wrapper>
);

export const BasicSetup = () => (
  <Wrapper>
    <SortableQuestionTree />
  </Wrapper>
);

export const DropIndicator = () => (
  <Wrapper>
    <SortableQuestionTree indicator />
  </Wrapper>
);

export const Collapsible = () => (
  <Wrapper>
    <SortableQuestionTree collapsible />
  </Wrapper>
);

export const RemovableItems = () => (
  <Wrapper>
    <SortableQuestionTree removable />
  </Wrapper>
);
