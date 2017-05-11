import 'rxjs/add/operator/let';
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import * as fromRoot from '../../core/store';
import { Contact } from '../../core/store/contact/contact.model';
import { User } from '../../core/store/user/user.model';
import * as EntityActions from '../../core/store/entity/entity.actions';
import { slices } from '../../core/store/util';
import { Entities } from '../../core/store/entity/entity.model';

const uuid = require('uuid');

@Component({
    selector: 'app-contact',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './contact.page.html',
    styleUrls: ['./contact.page.scss']
})
export class ContactPage implements OnInit {
    contact$: Observable<Contact>;

    msg$: Observable<string>;
    user$: Observable<User>;
    contactForm: FormGroup;
    adding: boolean;

    constructor(private store: Store<fromRoot.RootState>,
        private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.user$ = this.store.select(fromRoot.getUserState);
        this.msg$ = this.store.select(fromRoot.getMsg);
        this.contact$ = this.store.select(fromRoot.getContact);
        this.contact$.subscribe((contact) => {
            this.contactForm = this.formBuilder.group({
                name: [contact ? contact.name : '', Validators.required],  // TODO: fix this hack
                id: [contact ? contact.id : '', Validators.required]  // TODO: fix this hack
            });
            this.adding = contact && contact.id !== EntityActions.TEMP
        });
    }

    nextContact() {
        this.store.dispatch(new EntityActions.SelectNext<Contact>(slices.CONTACT));
    }

    newContact() {
        // this.store.dispatch(new EntityActions.Add(slices.CONTACT, {
        //       id: uuid.v1(),  // Pessimistic so ID determined by server
        //     name: ''
        // }));
        this.store.dispatch(new EntityActions.AddTemp(slices.CONTACT));
    }

    cancel() {
        this.store.dispatch(new EntityActions.DeleteTemp(slices.CONTACT));
    }

    onSubmit() {
        if (this.contactForm.value.id === EntityActions.TEMP) {
            this.store.dispatch(new EntityActions.Add(slices.CONTACT,
                this.contactForm.value));
        } else {
            this.store.dispatch(new EntityActions.Update(slices.CONTACT,
                this.contactForm.value));
        }
    }

    ngOnDestroy() {
        this.store.select(slices.CONTACT).subscribe((contacts: Entities<Contact>) => {
            if (contacts.entities[EntityActions.TEMP]) {
                this.store.dispatch(new EntityActions.DeleteTemp(slices.CONTACT));
            }
        }
        )
    }

}

/*
Copyright 2016 Google Inc. All Rights Reserved.
Use of this source code is governed by an MIT-style license that
can be found in the LICENSE file at http://angular.io/license
*/
