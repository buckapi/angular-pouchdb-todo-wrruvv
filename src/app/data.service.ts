import { Injectable, EventEmitter } from "@angular/core";

import PouchDB from "pouchdb";
import { toDo } from "../toDo.model";

@Injectable({
  providedIn: "root"
})
export class DataService {
  private db: any;
  private isInstantiated: boolean;
  private listener: EventEmitter<any> = new EventEmitter();

  public constructor() {
    if (!this.isInstantiated) {
      this.db = new PouchDB("toDos");
      this.isInstantiated = true;
    }
    
  }

  public fetch(): toDo[] {
    let items: toDo[] = [];
    this.db
      .allDocs({ include_docs: true, descending: true })
      .then(function(result) {
        for (let row of result.rows) {
          let todo: toDo = {
            _id: row.doc._id,
            name: row.doc.name,
            isDone: row.doc.isDone
          };
          console.log(todo);
          items.push(todo);
        }
      })
      .catch(function(err) {
        console.log(err);
      });
    return items;
  }

  public get(id: string) {
    return this.db.get(id);
  }

  public addNewToDoItem(toDoItem: toDo) {
    this.db
      .put(toDoItem)
      .then(function(result) {
        console.log("Successfully posted a todo!");
      })
      .catch(function(err) {
        console.log("Saving error");
        console.log(err);
      });
  }
  public put(id: string, document: any) {
    document._id = id;
    return this.get(id).then(
      result => {
        document._rev = result._rev;
        return this.db.put(document);
      },
      error => {
        if (error.status === "404") {
          return this.db.put(document);
        } else {
          return new Promise((resolve, reject) => {
            reject(error);
          });
        }
      }
    );
  }

  public sync(remote: string) {
    const remoteDatabase = new PouchDB(remote);
    this.db
      .sync(remoteDatabase, {
        live: true
      })
      .on("change", change => {
        this.listener.emit(change);
      })
      .on("error", error => {
        console.error(JSON.stringify(error));
      });
  }

  public getChangeListener() {
    return this.listener;
  }
}
