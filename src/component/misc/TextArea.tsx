import * as React from "react";
import {FormFeedback, FormGroup, Input} from "reactstrap";
import AbstractInput, {AbstractInputProps} from "./AbstractInput";

export interface TextAreaProps extends AbstractInputProps {
    onKeyPress?: (e: object) => void;
    rows?: number;
}

export default class TextArea extends AbstractInput<TextAreaProps> {

    protected readonly input: React.RefObject<Input>;

    constructor(props: TextAreaProps) {
        super(props);
        this.input = React.createRef();
    }


    public render() {
        return <FormGroup>
            {this.renderLabel()}
            <Input type="textarea" style={{height: "auto"}} bsSize="sm"
                   ref={this.input} {...this.inputProps()}/>
            <FormFeedback>{this.props.invalidMessage}</FormFeedback>
            {this.renderHelp()}
        </FormGroup>;
    }
}
