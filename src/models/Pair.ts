export default class Pair<K, V> {

    first: K;
    second: V | undefined;

    constructor(first: K, second: V | undefined) {
        this.first = first;
        this.second = second;
    }

}
