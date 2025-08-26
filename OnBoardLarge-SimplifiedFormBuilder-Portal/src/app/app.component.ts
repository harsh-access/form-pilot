import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'on-board-large-portal';
  constructor() {
    this.setConfiguration();
  }

  setConfiguration(): void {
    var configuration = {
      "changeDetection": true,
      "defaultLanguage": "English",
      "authorization": {
        "cacheMinutes": 30
      },
      "spinner": {
        "loadingText": "Loadings"
      },
      "dataOperation": {
        "post": "Data added successfully",
        "put": "Data updated successfully",
        "delete": "Data deleted successfully",
        "patch": "Data updated successfully"
      },
      "popup": {
        "validationFailed": {
          "title": "Validation Failed",
          "ok": "Ok"
        },
        "unauthorized": {
          "oops": "Oops",
          "message": "You don't have access right of this item",
          "ok": "Ok"
        }
      },
      "dialog": {
        "okText": "Ok",
        "cancelText": "Cancel",
        "style": {
          "main": "",
          "header": "alert-header",
          "body": "",
          "footer": "",
          "okClick": "",
          "cancelClick": "",
          "secondaryClick": ""
        },
        "confirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Please confirm",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}' ?",
            "inactive": "are you sure you want to inactive '{0}' ?",
            "active": "Are you sure you want to active '{0}' ?",
            "saveChanges": "Once you submit the application you will not be able to modify the application. Are you sure want to submit the application?",
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "alert": {
          "okText": "Ok",
          "title": "Alert!",
          "style": {
            "okClick": ""
          }
        },
        "loginAlert": {
          "okText": "Error",
          "title": "Login Error !",
          "style": {
            "okClick": ""
          }
        },
        "saveConfirmation": {
          "title": "Data lost confirmation!",
          "saveText": "Save",
          "dontSaveText": "Don't Save",
          "style": {
            "okClick": "",
            "secondaryClick": "",
            "cancelClick": ""
          }
        },
        "validation": {
          "okText": "Ok",
          "title": "Alert",
          "style": {
            "okClick": ""
          }
        },
        "deleteRoleConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Role",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteUserConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete User",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "clientSetupCompletion": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Client Setup Completion",
          "messageType": {
            "completesetup": "Are you sure you want to complete setup '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteClientConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Client",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteContactConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Contact",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteRiskRatingConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Risk Rating",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteProjectConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Project",
          "messageType": {
            "delete": "Are you sure you want to delete '{0}'?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        },
        "deleteAdditionScopeConfirmation": {
          "okText": "Yes",
          "cancelText": "No",
          "title": "Delete Additional Scope",
          "messageType": {
            "additionalScopeDelete": "Are you sure you want to delete {0}?"
          },
          "style": {
            "okClick": "",
            "cancelClick": ""
          }
        }
      },
      "placeholder": {
        "text": "Pleaseter the value of",
        "select": "Please select the value of",
        "checkbox": "Please choose the value of",
        "radio": "Please choose the value of",
        "file": "Please upload",
        "textarea": "Please enter the value of",
        "password": "Pleaseter the value of",
        "email": "Please enter the value of"
      },
      "validation": {
        "messageDisplayType": "Both",
        "message": {
          "default": {
            "required": "You can't leave this empty",
            "minlength": "Minimum #n# characters required",
            "maxlength": "More than #n# characters are not permitted",
            "pattern": "The specified input format is not recognized",
            "compare": "The specified values of '#field1#' and '#field2#' must be the same",
            "contains": "The specified value must '#value#' in the input",
            "alpha": "You can use letters and periods only",
            "alphanumeric": "You can use letters, numbers and periods only",
            "range": "You need toter appropriate value in this field"
          },
          "custom": {
            "userNameRequired": "This UserName is Required."
          }
        }
      },
      "internationalization": {
        "currencyCode": "INR",
        "date": {
          "format": "dmy",
          "seperator": "/"
        }
      },
      "control": {
        "rxTag": {
          "splitCharacter": ",",
          "message": {
            "maxSelection": "You can only select {maxSelection items"
          }
        },
        "rxTable": {
          "formatters": {
            "date": "dd/mm/yyyy"
          },
          "pageSize": 15,
          "controlClass": {
            "table": "table table-bordered table-responsive dataTable no-footer dtr-inline"
          },
          "masterClass": {
            "asc": "sorting_asc fa fa-arrow-up right-arrow",
            "desc": "sorting_desc fa fa-arrow-down right-arrow",
            "openDetail": "fa fa-minus",
            "closeDetail": "fa fa-plus"
          },
          "label": {
            "footerText": "Showing {{startNumber}} to {{endNumber}} of {{totalNumber}} entries",
            "notFound": "Records not found",
            "dataNotAvailable": "Data Not Available"
          }
        }
      },
      "cacheKeys": {}
    }
  }
}
