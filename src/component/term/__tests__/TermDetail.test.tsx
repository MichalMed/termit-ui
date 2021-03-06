import * as React from "react";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";
import {shallow} from "enzyme";
import {TermDetail} from "../TermDetail";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import TermMetadata from "../TermMetadata";
import TermMetadataEdit from "../TermMetadataEdit";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import AppNotification from "../../../model/AppNotification";
import NotificationType from "../../../model/NotificationType";
import {IRI} from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import {langString} from "../../../model/MultilingualString";
import {constructValidationResult} from "../validation/__tests__/ValidationResults.test";
import ValidationResult from "../../../model/ValidationResult";
import Constants from "../../../util/Constants";

jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../../misc/AssetLabel");
jest.mock("../../changetracking/AssetHistory");

describe("TermDetail", () => {

    const normalizedTermName = "test-term";
    const normalizedVocabName = "test-vocabulary";

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    let onLoad: (termName: string, vocabIri: IRI) => Promise<any>;
    let loadVocabulary: (iri: IRI) => void;
    let onUpdate: (term: Term) => Promise<any>;
    let removeTerm: (term: Term) => Promise<any>;
    let onPublishNotification: (notification: AppNotification) => void;

    let vocabulary: Vocabulary;
    let term: Term;
    let validationResults: { [vocabularyIri: string]: ValidationResult[] };

    beforeEach(() => {
        location = {
            pathname: "/vocabulary/" + normalizedVocabName + "/term/" + normalizedTermName,
            search: "",
            hash: "",
            state: {}
        };
        match = {
            params: {
                name: normalizedVocabName,
                termName: normalizedTermName
            },
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
        onLoad = jest.fn().mockImplementation(() => Promise.resolve());
        loadVocabulary = jest.fn();
        onUpdate = jest.fn().mockImplementation(() => Promise.resolve());
        removeTerm = jest.fn().mockImplementation(() => Promise.resolve());
        onPublishNotification = jest.fn();
        vocabulary = Generator.generateVocabulary();
        validationResults = {
            [vocabulary.iri]: [
                constructValidationResult("https://example.org/term1")
            ]
        };
        term = new Term({
            iri: Generator.generateUri(),
            label: langString("Test term"),
            vocabulary: {iri: Generator.generateUri()},
            draft: true
        });
    });

    it("loads term on mount", () => {
        shallow(<TermDetail term={null} loadTerm={onLoad} updateTerm={onUpdate} removeTerm={removeTerm}
                            loadVocabulary={loadVocabulary} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                            publishNotification={onPublishNotification} vocabulary={vocabulary}
                            history={history} location={location} match={match} validationResults={validationResults}
                            {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName});
    });

    it("provides namespace to term loading when specified in url", () => {
        const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
        location.search = "?namespace=" + namespace;
        shallow(<TermDetail term={null} loadTerm={onLoad} updateTerm={onUpdate} removeTerm={removeTerm}
                            loadVocabulary={loadVocabulary} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                            history={history} location={location} match={match} vocabulary={vocabulary}
                            publishNotification={onPublishNotification} validationResults={validationResults}
                            {...intlFunctions()}/>);
        expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName, namespace});
    });

    it("renders term metadata by default", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        expect(wrapper.exists(TermMetadata)).toBeTruthy();
    });

    it("renders term editor after clicking edit button", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        expect(wrapper.find(TermMetadataEdit).exists()).toBeTruthy();
    });

    it("invokes termUpdate action on save", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onSave(term);
        expect(onUpdate).toHaveBeenCalledWith(term);
    });

    it("closes term metadata edit on save success", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            removeTerm={removeTerm}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match} vocabulary={vocabulary}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        (wrapper.instance() as TermDetail).onSave(term);
        return Promise.resolve().then(() => {
            wrapper.update();
            expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
        });
    });

    it("reloads term on successful save", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onSave(term);
        return Promise.resolve().then(() => {
            expect(onLoad).toHaveBeenCalledWith(normalizedTermName, {fragment: normalizedVocabName});
        });
    });

    it("closes edit when different term is selected", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                            removeTerm={removeTerm} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                            history={history} location={location} match={match}
                                            publishNotification={onPublishNotification}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        (wrapper.instance() as TermDetail).onEdit();
        wrapper.update();
        expect((wrapper.instance() as TermDetail).state.edit).toBeTruthy();
        const newMatch = {
            params: {
                name: normalizedVocabName,
                termName: "differentTerm"
            },
            path: "/different",
            isExact: true,
            url: "http://localhost:3000/different"
        };
        wrapper.setProps({match: newMatch});
        wrapper.update();
        expect((wrapper.instance() as TermDetail).state.edit).toBeFalsy();
    });

    it("does not render edit button when editing", () => {
        const wrapper = shallow(<TermDetail term={term} loadTerm={onLoad} loadVocabulary={loadVocabulary}
                                            updateTerm={onUpdate} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                            removeTerm={removeTerm}
                                            vocabulary={vocabulary}
                                            publishNotification={onPublishNotification}
                                            history={history} location={location} match={match}
                                            validationResults={validationResults}
                                            {...intlFunctions()}/>);
        const buttons = (wrapper.instance() as TermDetail).getActions();
        expect(buttons.some(b => b.key === "term-detail-edit"));
        (wrapper.instance() as TermDetail).onEdit();
        expect(buttons.every(b => b.key !== "term-detail-edit"));
    });

    it("publishes term update notification when parent term changes", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={term} loadTerm={onLoad} updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                                        loadVocabulary={loadVocabulary} vocabulary={vocabulary}
                                                        history={history} location={location} match={match}
                                                        publishNotification={onPublishNotification}
                                                        validationResults={validationResults}
                                                        {...intlFunctions()}/>);
        const update = new Term(Object.assign({}, term));
        const newParent = Generator.generateUri();
        update.parentTerms = [new Term({iri: newParent, label: langString("New parent"), draft: true})];
        wrapper.instance().onSave(update);
        return Promise.resolve().then(() => {
            expect(onPublishNotification).toHaveBeenCalledWith({source: {type: NotificationType.TERM_HIERARCHY_UPDATED}});
        });
    });

    it("invokes remove action and closes remove confirmation dialog on remove", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={term} configuredLanguage={Constants.DEFAULT_LANGUAGE}
                                                        loadTerm={onLoad}
                                                        updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary}
                                                        vocabulary={vocabulary}
                                                        history={history}
                                                        location={location}
                                                        match={match}
                                                        publishNotification={onPublishNotification}
                                                        validationResults={validationResults}
                                                        {...intlFunctions()}/>);
        wrapper.instance().onRemove();
        expect(removeTerm).toHaveBeenCalledWith(term);
        expect(wrapper.state("showRemoveDialog")).toBeFalsy();
    });

    it("renders term initially in language corresponding to UI", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={term} configuredLanguage="cs"
                                                        loadTerm={onLoad}
                                                        updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary}
                                                        vocabulary={vocabulary}
                                                        history={history}
                                                        location={location}
                                                        match={match}
                                                        publishNotification={onPublishNotification}
                                                        validationResults={validationResults}
                                                        {...intlFunctions()}/>);
        expect(wrapper.find(TermMetadata).prop("language")).toEqual(Constants.DEFAULT_LANGUAGE);
    });

    it("renders term in configured language when UI language is not supported", () => {
        const lang = "cs";
        term.label = langString("Pouze česky", lang);
        const wrapper = shallow<TermDetail>(<TermDetail term={term} configuredLanguage={lang}
                                                        loadTerm={onLoad}
                                                        updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary}
                                                        vocabulary={vocabulary}
                                                        history={history}
                                                        location={location}
                                                        match={match}
                                                        publishNotification={onPublishNotification}
                                                        validationResults={validationResults}
                                                        {...intlFunctions()}/>);
        expect(wrapper.find(TermMetadata).prop("language")).toEqual(lang);
    });

    it("postpones language resolution until term is loaded", () => {
        const wrapper = shallow<TermDetail>(<TermDetail term={null} configuredLanguage="cs"
                                                        loadTerm={onLoad}
                                                        updateTerm={onUpdate}
                                                        removeTerm={removeTerm}
                                                        loadVocabulary={loadVocabulary}
                                                        vocabulary={vocabulary}
                                                        history={history}
                                                        location={location}
                                                        match={match}
                                                        publishNotification={onPublishNotification}
                                                        validationResults={validationResults}
                                                        {...intlFunctions()}/>);
        wrapper.setProps({term});
        wrapper.update();
        expect(wrapper.find(TermMetadata).prop("language")).toEqual(Constants.DEFAULT_LANGUAGE);
    });
});
