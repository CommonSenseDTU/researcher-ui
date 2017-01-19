// @flow
'use strict';

export type ConsentSection = {
  id: string,
  creation_date_time: string,
  modification_date_time: string,
  type: string,
  title: string,
  summary?: string,
  content?: string
};

export type ConsentDocument = {
  id: string,
  creation_date_time: string,
  modification_date_time: string,
  sections: ConsentSection[]
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
