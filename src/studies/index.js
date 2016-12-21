import Base from '../base.router.js';

export default class extends Base {
  
  constructor(opts) {
    super('./src/studies', opts);
    
    var self = this;
    this.router.get('/', function (ctx, next) {
      var copy = self.naiveShallowCopy(self.opts);
      // TODO: load data from service instead of mockup
      copy.studies = [
        {
          title: 'Mood study',
          icon: '/src/studies/assets/app-icon.png',
          participantIds: [1, 2, 3],
          consentDocument: {
            sections: [
              {
                title: 'Introduction'
              }
            ]
          },
          task: {
            steps: [
              {
                question: 'How are you feeling?'
              }
            ]
          }
        }
      ];
      ctx.body = self.template(copy);
    });
  }
}