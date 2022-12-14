import { Component, VERSION } from "@angular/core";
import { getMatFormFieldPlaceholderConflictError } from "@angular/material/form-field";
import { toDo } from "../toDo.model";
import { DataService } from "./data.service";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  toDos: toDo[] = [];
  toDoName: string = "";

  public constructor(private database: DataService) {}
  public ngOnInit() {
    this.database.sync("http://localhost:3000/todos");
    this.database.getChangeListener().subscribe(data => {
      for (let i = 0; i < data.change.docs.length; i++) {
        this.toDos.push(data.change.docs[i]);
      }
    });
    this.toDos = this.database.fetch();
  }

  AddToDo() {
    let newToDo: toDo = {
      _id: new Date().toISOString(),
      name: this.toDoName,
      isDone: false
    };
    this.database.addNewToDoItem(newToDo);
    this.toDos = this.database.fetch();
    this.toDoName = "";
  }
}
