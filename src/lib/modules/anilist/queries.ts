import gql from './gql'

export const FullMediaList = gql(`
  fragment FullMediaList on MediaList @_unmask {
    id,
    status,
    progress,
    repeat,
    score(format: POINT_10),
    customLists(asArray: true)
  }
`)

export const MediaEdgeFrag = gql(`
  fragment MediaEdgeFrag on MediaEdge @_unmask {
    relationType(version:2),
    node {
      id,
      title {userPreferred},
      coverImage {medium},
      type,
      status,
      format,
      episodes,
      synonyms,
      season,
      seasonYear,
      startDate {
        year,
        month,
        day
      },
      endDate {
        year,
        month,
        day
      }
    }
  }
`)

export const FullMedia = gql(`
  fragment FullMedia on Media @_unmask {
id,
idMal,
title {
  romaji,
  english,
  native,
  userPreferred
},
description(asHtml: false),
season,
seasonYear,
format,
status,
episodes,
duration,
averageScore,
genres,
isFavourite,
coverImage {
  extraLarge,
  medium,
  color,
},
source,
countryOfOrigin,
isAdult,
bannerImage,
synonyms,
nextAiringEpisode {
  id,
  timeUntilAiring,
  episode
},
startDate {
  year,
  month,
  day
},
trailer {
  id,
  site
},
mediaListEntry {
  ...FullMediaList
},
studios(isMain: true) {
  nodes {
    id,
    name
  }
},
notaired: airingSchedule(page: 1, perPage: 50, notYetAired: true) {
  n: nodes {
    a: airingAt,
    e: episode
  }
},
aired: airingSchedule(page: 1, perPage: 50, notYetAired: false) {
  n: nodes {
    a: airingAt,
    e: episode
  }
},
relations {
  edges {
    ...MediaEdgeFrag
  }
}
}`, [FullMediaList, MediaEdgeFrag])

export const Search = gql(`
  query Search($page: Int, $perPage: Int, $search: String, $genre: [String], $format: [MediaFormat], $status: [MediaStatus], $statusNot: [MediaStatus], $season: MediaSeason, $seasonYear: Int, $isAdult: Boolean, $sort: [MediaSort], $onList: Boolean, $ids: [Int]) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage
      },
      media(type: ANIME, format_not: MUSIC, id_in: $ids, search: $search, genre_in: $genre, format_in: $format, status_in: $status, status_not_in: $statusNot, season: $season, seasonYear: $seasonYear, isAdult: $isAdult, sort: $sort, onList: $onList) {
        ...FullMedia
      }
    }
  }
`, [FullMedia])

export const IDMedia = gql(`
  query IDMedia($id: Int!) {
    Media(id: $id, type: ANIME) {
      ...FullMedia
    }
  }
`, [FullMedia])

export const Viewer = gql(`
  query Viewer {
    Viewer {
      avatar {
        medium
      },
      name,
      id,
      mediaListOptions {
        animeList {
          customLists
        }
      }
    }
  }
`)

export const UserLists = gql(`
  query UserLists($id: Int) {
    MediaListCollection(userId: $id, type: ANIME, forceSingleCompletedList: true, sort: UPDATED_TIME_DESC) {
      user {
        id
      }
      lists {
        status,
        entries {
          id,
          media {
            id,
            status,
            mediaListEntry {
              ...FullMediaList
            },
            nextAiringEpisode {
              episode
            },
            relations {
              edges {
                relationType(version:2)
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
`, [FullMediaList])

export const CustomLists = gql(`
  mutation CustomLists($lists: [String]) {
    UpdateUser(animeListOptions: { customLists: $lists }) {
      id
    }
  }
`)

export const ScheduleMedia = gql(`
  fragment ScheduleMedia on Media @_unmask {
    id,
    title {
      userPreferred
    }
    mediaListEntry {
      status,
      id
    }
    aired: airingSchedule(page: 1, perPage: 50, notYetAired: false) {
      n: nodes {
        a: airingAt,
        e: episode
      }
    },
    notaired: airingSchedule(page: 1, perPage: 50, notYetAired: true) {
      n: nodes {
        a: airingAt,
        e: episode
      }
    }
  }
`)

export const Schedule = gql(`
  query Schedule($seasonCurrent: MediaSeason, $seasonYearCurrent: Int, $seasonLast: MediaSeason, $seasonYearLast: Int, $seasonNext: MediaSeason, $seasonYearNext: Int, $ids: [Int]) {
    curr1: Page(page: 1) {
      media(type: ANIME, season: $seasonCurrent, seasonYear: $seasonYearCurrent, countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    }
    curr2: Page(page: 2) {
      media(type: ANIME, season: $seasonCurrent, seasonYear: $seasonYearCurrent, countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    }
    curr3: Page(page: 3) {
      media(type: ANIME, season: $seasonCurrent, seasonYear: $seasonYearCurrent, countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    }
    residue: Page(page: 1) {
      media(type: ANIME, season: $seasonLast, seasonYear: $seasonYearLast, episodes_greater: 16, countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    },
    next1: Page(page: 1) {
      media(type: ANIME, season: $seasonNext, seasonYear: $seasonYearNext, sort: [START_DATE], countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    },
    next2: Page(page: 2) {
      media(type: ANIME, season: $seasonNext, seasonYear: $seasonYearNext, sort: [START_DATE], countryOfOrigin: JP, format_not: TV_SHORT, onList: true, id_in: $ids) {
        ...ScheduleMedia
      }
    }
  }
`, [ScheduleMedia])

export const UserFrag = gql(`
  fragment UserFrag on User @_unmask {
    id,
    bannerImage,
    about,
    isFollowing,
    isFollower,
    donatorBadge,
    options {
      profileColor
    },
    createdAt,
    name,
    avatar {
      medium
    },
    statistics {
      anime {
        count,
        minutesWatched,
        episodesWatched,
        genres(limit: 3, sort: COUNT_DESC) {
          genre,
          count
        }
      }
    }
  }
`)

export const Following = gql(`
  query Following($id: Int!) {
    Page {
      mediaList(mediaId: $id, isFollowing: true, sort: UPDATED_TIME_DESC) {
        id,
        status,
        score,
        progress,
        user {
          ...UserFrag
        }
      }
    }
  }
`, [UserFrag])

// AL API is dog, fullmedialist is NULL when queried inside media..., it's possible this can cause cache loops, but there's no other way to do this!!!
export const Entry = gql(`
  mutation Entry($lists: [String], $id: Int!, $status: MediaListStatus, $progress: Int, $repeat: Int, $score: Int) {
    SaveMediaListEntry(mediaId: $id, status: $status, progress: $progress, repeat: $repeat, scoreRaw: $score, customLists: $lists) {
      id,
      ...FullMediaList,
      media {
        id
      }
    }
  }
`, [FullMediaList])

export const DeleteEntry = gql(`
  mutation DeleteEntry($id: Int!) {
    DeleteMediaListEntry(id: $id) {
      deleted
    }
  }
`)

export const ToggleFavourite = gql(`
  mutation ToggleFavourite($id: Int!) {
    ToggleFavourite(animeId: $id) { anime { nodes { id } } } 
  }
`)

export const ThreadFrag = gql(`
  fragment ThreadFrag on Thread @_unmask {
    id,
    title,
    body,
    userId,
    replyCount,
    viewCount,
    isLocked,
    isSubscribed,
    isLiked,
    likeCount,
    repliedAt,
    createdAt,
    user {
      ...UserFrag
    },
    categories {
      id,
      name
    }
  }
`, [UserFrag])

export const Threads = gql(`
  query Threads($id: Int!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        hasNextPage,
        total
      },
      threads(mediaCategoryId: $id, sort: ID_DESC) {
        ...ThreadFrag
      }
    }
  }
`, [ThreadFrag])

export const Thread = gql(`
  query Thread($threadId: Int!) {
    Thread(id: $threadId) {
      ...ThreadFrag
    }
  }
`, [ThreadFrag])

export const CommentFrag = gql(`
  fragment CommentFrag on ThreadComment @_unmask {
    id,
    comment,
    isLiked,
    likeCount,
    createdAt,
    user {
      ...UserFrag
    },
    childComments,
    isLocked
  }
`, [UserFrag])

// AL in their infinite wisdom decided to make childComments infer the schema of the parent comment, but fragments break it, so we can't use any fragments here
export const Comments = gql(`
  query Comments($threadId: Int, $page: Int) {
    Page(page: $page, perPage: 15) {
      pageInfo {
        hasNextPage,
        total
      }
      threadComments(threadId: $threadId) {
        id,
        comment,
        isLiked,
        likeCount,
        createdAt,
        user {
          id,
          bannerImage,
          about,
          isFollowing,
          isFollower,
          donatorBadge,
          options {
            profileColor
          },
          createdAt,
          name,
          avatar {
            medium
          },
          statistics {
            anime {
              count,
              minutesWatched,
              episodesWatched,
              genres(limit: 3, sort: COUNT_DESC) {
                genre,
                count
              }
            }
          }
        },
        childComments,
        isLocked
      }
    }
  }
`)

export const ToggleLike = gql(`
  mutation ToggleLike ($id: Int!, $type: LikeableType!) {
    ToggleLikeV2(id: $id, type: $type) {
      ... on Thread {
        id
        likeCount
        isLiked
      }
      ... on ThreadComment {
        id
        likeCount
        isLiked
      }
    }
  }
`)

export const SaveThreadComment = gql(`
  mutation SaveThreadComment ($id: Int, $threadId: Int, $parentCommentId: Int, $comment: String) {
    SaveThreadComment(id: $id, threadId: $threadId, parentCommentId: $parentCommentId, comment: $comment) {
      ...CommentFrag
    }
  }
`, [CommentFrag])

export const DeleteThreadComment = gql(`
  mutation DeleteThreadComment ($id: Int) {
    DeleteThreadComment(id: $id) {
      deleted
    }
  }
`)
