// @flow
'use strict';

export type ConsentSection = {
  id: string,
  creation_date_time: string,
  modification_date_time: string,
  type: string,
  title: string,
  summary?: string,
  content?: string,
  popup?: string,
  options?: string[]
};

export type ConsentDocument = {
  id: string,
  creation_date_time: string,
  modification_date_time: string,
  sections: ConsentSection[]
};

export type StepItem = {
  id: string,
  format: string,
  question: string
}

export type Step = {
  id: string,
  type: string,
  title: string,
  settings?: ?any,
  sensors?: string[],
  private?: boolean,
  items?: any[],
  skippable?: boolean
};

export type Task = {
  id: string,
  steps: any[]
};

export type Survey = {
  id: string,
  title: string,
  user_id: string,
  icon: string,
  creation_date_time: string,
  consent_document: ConsentDocument,
  task: Task,
  participant_ids: string[]
};
