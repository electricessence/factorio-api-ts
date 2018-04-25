/*!
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT
 */

import stp, {StreamToPromise} from "stream-to-promise-agnostic";

const streamToPromise:StreamToPromise = stp(e=>new Promise(e));
export default streamToPromise;