import moment from "moment";

export function CompareDates(a: string, b: string) {
	return new Date(b) > new Date(a) ? 1 : -1;
}

export function RelativeToNow(time: string) {
	return moment(time).fromNow();
}
